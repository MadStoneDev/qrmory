"use server";

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const { shortcode, saved } = await req.json();

    if (!shortcode) {
      return NextResponse.json(
        { error: "Shortcode is required" },
        { status: 400 },
      );
    }

    // If the code wasn't saved, delete the reservation
    if (!saved) {
      await redis.del(`reserved:${shortcode}`);
    } else {
      // If saved, we could optionally mark it as permanent
      // This isn't strictly necessary but helps with debugging
      await redis.set(`reserved:${shortcode}`, "permanent");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to release shortcode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
