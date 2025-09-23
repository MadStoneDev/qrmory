// app/api/release-shortcode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { shortcode, saved = false } = await request.json();

    if (!shortcode) {
      return NextResponse.json(
        { error: "Shortcode is required" },
        { status: 400 },
      );
    }

    // If the shortcode was saved, don't release it
    if (saved) {
      return NextResponse.json({
        success: true,
        message: "Shortcode preserved",
      });
    }

    // Remove the reservation
    await redis.del(`reserved:${shortcode}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to release shortcode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
