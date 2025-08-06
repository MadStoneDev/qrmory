// app/api/rate-limit-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { RateLimiter } from "@/lib/rate-limiter";
import { createClient } from "@/utils/supabase/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  const operation = request.nextUrl.searchParams.get("operation");

  if (!operation) {
    return NextResponse.json({ error: "Operation required" }, { status: 400 });
  }

  try {
    // Get user info from Supabase auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let identifier: string;

    if (user) {
      identifier = `user:${user.id}`;
    } else {
      identifier = RateLimiter.getClientIdentifier(request);
    }

    // Get current status without incrementing
    const key = `rate_limit:${operation}:${identifier}`;
    const currentCount = (await redis.get(key)) || 0;
    const ttl = (await redis.ttl(key)) || 60;

    const config = RateLimiter.configs[
      operation as keyof typeof RateLimiter.configs
    ] || { requests: 100, window: 60 };

    const remaining = Math.max(0, config.requests - (currentCount as number));
    const resetTime = Date.now() + ttl * 1000;
    const blocked = (currentCount as number) >= config.requests;

    return NextResponse.json({
      remaining,
      resetTime,
      blocked,
      limit: config.requests,
      window: config.window,
    });
  } catch (error) {
    console.error("Rate limit status error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
