import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  enableAutoPipelining: false,
});

export async function POST(req: NextRequest) {
  try {
    const { attemptsNeeded, success } = await req.json();

    // Get current date for key
    const date = new Date().toISOString().split("T")[0];

    // Keys for various metrics
    const totalAttemptsKey = `shortcode:metrics:${date}:total_attempts`;
    const multipleAttemptsKey = `shortcode:metrics:${date}:multiple_attempts`;
    const failuresKey = `shortcode:metrics:${date}:failures`;
    const histogramKey = `shortcode:metrics:${date}:attempts_histogram`;

    // Increment total attempts
    await redis.incrby(totalAttemptsKey, attemptsNeeded);

    // If multiple attempts were needed, increment counter
    if (attemptsNeeded > 1) {
      await redis.incr(multipleAttemptsKey);
    }

    // Track failures
    if (!success) {
      await redis.incr(failuresKey);
    }

    // Update histogram
    await redis.hincrby(histogramKey, attemptsNeeded.toString(), 1);

    // Set TTL of 90 days for all metrics
    const keys = [
      totalAttemptsKey,
      multipleAttemptsKey,
      failuresKey,
      histogramKey,
    ];
    for (const key of keys) {
      await redis.expire(key, 60 * 60 * 24 * 90);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log shortcode metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
