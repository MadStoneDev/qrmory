// app/api/generate-shortcode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { RateLimiter, UserRateLimiter } from "@/lib/rate-limiter";
import { generateShortCode } from "@/utils/general";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user's subscription level for rate limiting
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_level")
      .eq("id", user.id)
      .single();

    const subscriptionLevel = (profile?.subscription_level || 0) as
      | 0
      | 1
      | 2
      | 3;

    // Apply rate limiting based on subscription level
    const rateLimitResult = await UserRateLimiter.checkUserLimit(
      "qr_generation", // Using qr_generation since shortcode_generation might not exist
      user.id,
      subscriptionLevel,
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: rateLimitResult.retryAfter,
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "50", // Default fallback
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": Math.ceil(
              rateLimitResult.resetTime / 1000,
            ).toString(),
            "Retry-After": (rateLimitResult.retryAfter || 60).toString(),
          },
        },
      );
    }

    // Generate unique shortcode
    const shortcode = await generateUniqueShortcode();

    // Reserve the shortcode
    await reserveShortcode(shortcode, user.id);

    return NextResponse.json({
      shortcode,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime,
    });
  } catch (error) {
    console.error("Shortcode generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate shortcode" },
      { status: 500 },
    );
  }
}

async function generateUniqueShortcode(maxAttempts = 10): Promise<string> {
  const supabase = await createClient();

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const shortcode = generateShortCode(attempts > 5 ? 9 : 8);

    // Check if shortcode is reserved in Redis
    const isReserved = await redis.exists(`reserved:${shortcode}`);
    if (isReserved) continue;

    // Check if shortcode exists in database
    const { data } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("shortcode", shortcode)
      .single();

    if (!data) {
      return shortcode; // Available shortcode found
    }
  }

  throw new Error(
    `Could not generate unique shortcode after ${maxAttempts} attempts`,
  );
}

async function reserveShortcode(
  shortcode: string,
  userId: string,
  ttlSeconds = 300,
): Promise<void> {
  const reservationData = {
    userId,
    reservedAt: Date.now(),
    origin: "generation",
  };

  await redis.setex(
    `reserved:${shortcode}`,
    ttlSeconds,
    JSON.stringify(reservationData),
  );
}
