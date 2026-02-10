// /app/api/reserve-shortcode/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

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
    const { shortcode, userId } = await req.json();

    if (!shortcode) {
      return NextResponse.json(
        { error: "Shortcode is required" },
        { status: 400 },
      );
    }

    // Store reservation with TTL
    // Format: "reserved:{shortcode}" => userId or "anonymous"
    await redis.set(`reserved:${shortcode}`, userId || "anonymous", {
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
