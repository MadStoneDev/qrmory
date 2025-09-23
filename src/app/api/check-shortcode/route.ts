// /app/api/check-shortcode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { createClient } from "@/utils/supabase/server";

// Mark this route as dynamic
export const dynamic = "force-dynamic";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  try {
    const shortcode = req.nextUrl.searchParams.get("code");

    if (!shortcode) {
      return NextResponse.json(
        { error: "Shortcode is required" },
        { status: 400 },
      );
    }

    // Check if the shortcode is reserved in Redis
    const isReserved = await redis.exists(`reserved:${shortcode}`);

    if (isReserved) {
      return NextResponse.json({
        available: false,
        reason: "reserved",
      });
    }

    // Check if the shortcode exists in Supabase
    const supabase = await createClient();
    const { data } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("shortcode", shortcode)
      .single();

    if (data) {
      return NextResponse.json({
        available: false,
        reason: "exists",
      });
    }

    // If we got here, the shortcode is available
    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Failed to check shortcode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
