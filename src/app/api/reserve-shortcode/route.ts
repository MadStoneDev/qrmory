// /app/api/reserve-shortcode/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { createClient } from "@/utils/supabase/server";
import { RateLimiter } from "@/lib/rate-limiter";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  enableAutoPipelining: false,
});

// TTL in seconds (5 minutes)
const RESERVATION_TTL = 300;

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Rate limit shortcode reservations
    const rateLimitResult = await RateLimiter.checkLimit(
      "shortcode_generation",
      `user:${user.id}`,
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimitResult.retryAfter },
        { status: 429 },
      );
    }

    const { shortcode } = await req.json();

    if (!shortcode) {
      return NextResponse.json(
        { error: "Shortcode is required" },
        { status: 400 },
      );
    }

    // Store reservation with TTL, tied to authenticated user
    await redis.set(`reserved:${shortcode}`, user.id, {
      ex: RESERVATION_TTL,
    });

    return NextResponse.json({
      success: true,
      ttl: RESERVATION_TTL,
    });
  } catch (error) {
    console.error("Failed to reserve shortcode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
