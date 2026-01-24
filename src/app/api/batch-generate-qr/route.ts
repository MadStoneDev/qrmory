// app/api/batch-generate-qr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateShortCode } from "@/utils/general";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Batch limits by subscription level
const BATCH_LIMITS = {
  0: 0, // Free - no batch generation
  1: 10, // Explorer
  2: 25, // Creator
  3: 50, // Champion
};

interface BatchItem {
  name: string;
  value: string;
}

interface BatchRequestBody {
  pattern: string; // e.g., "Table {n}" or "Room #{n}"
  valuePattern: string; // e.g., "https://menu.example.com/table/{n}"
  rangeStart: number;
  rangeEnd: number;
  qrType?: string; // default "website"
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's subscription level
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_level")
      .eq("id", user.id)
      .single();

    const subscriptionLevel = (profile?.subscription_level || 0) as 0 | 1 | 2 | 3;
    const batchLimit = BATCH_LIMITS[subscriptionLevel];

    // Check if user can use batch generation
    if (batchLimit === 0) {
      return NextResponse.json(
        {
          error: "Batch generation requires a paid subscription",
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body: BatchRequestBody = await request.json();
    const { pattern, valuePattern, rangeStart, rangeEnd, qrType = "website" } = body;

    // Validate inputs
    if (!pattern || !valuePattern) {
      return NextResponse.json(
        { error: "Pattern and value pattern are required" },
        { status: 400 }
      );
    }

    if (rangeStart >= rangeEnd) {
      return NextResponse.json(
        { error: "Range start must be less than range end" },
        { status: 400 }
      );
    }

    const count = rangeEnd - rangeStart;
    if (count > batchLimit) {
      return NextResponse.json(
        {
          error: `Your plan allows up to ${batchLimit} QR codes per batch. Requested: ${count}`,
          limit: batchLimit,
        },
        { status: 400 }
      );
    }

    // Check user's existing quota
    const { count: existingCount } = await supabase
      .from("qr_codes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "dynamic");

    // Get quota limits based on subscription
    const QUOTA_LIMITS = {
      0: 3, // Free
      1: 25, // Explorer
      2: 100, // Creator
      3: 500, // Champion
    };

    const quotaLimit = QUOTA_LIMITS[subscriptionLevel];
    const currentCount = existingCount || 0;

    if (currentCount + count > quotaLimit) {
      return NextResponse.json(
        {
          error: `Adding ${count} codes would exceed your quota. Current: ${currentCount}/${quotaLimit}`,
          currentCount,
          quotaLimit,
          requested: count,
        },
        { status: 400 }
      );
    }

    // Generate batch items
    const batchItems: BatchItem[] = [];
    for (let i = rangeStart; i < rangeEnd; i++) {
      batchItems.push({
        name: pattern.replace(/\{n\}/g, i.toString()),
        value: valuePattern.replace(/\{n\}/g, i.toString()),
      });
    }

    // Generate unique shortcodes and create QR codes
    const createdCodes: Array<{
      id: string;
      name: string;
      shortcode: string;
      value: string;
      url: string;
    }> = [];

    const errors: Array<{ name: string; error: string }> = [];

    for (const item of batchItems) {
      try {
        // Generate unique shortcode
        const shortcode = await generateUniqueShortcode();

        // Reserve in Redis temporarily
        await redis.setex(
          `reserved:${shortcode}`,
          300,
          JSON.stringify({
            userId: user.id,
            reservedAt: Date.now(),
            origin: "batch_generation",
          })
        );

        // Insert into database
        const { data, error: insertError } = await supabase
          .from("qr_codes")
          .insert({
            user_id: user.id,
            type: "dynamic",
            title: item.name,
            qr_value: item.value,
            shortcode: shortcode,
            is_active: true,
            content: {
              controlType: qrType,
              batchGenerated: true,
              batchPattern: pattern,
              creatorId: user.id,
            },
          })
          .select("id")
          .single();

        if (insertError) {
          errors.push({ name: item.name, error: insertError.message });
          // Release the shortcode reservation on error
          await redis.del(`reserved:${shortcode}`);
        } else {
          createdCodes.push({
            id: data.id,
            name: item.name,
            shortcode,
            value: item.value,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${shortcode}`,
          });
        }
      } catch (err) {
        errors.push({
          name: item.name,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      created: createdCodes.length,
      total: batchItems.length,
      codes: createdCodes,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Batch generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate batch QR codes" },
      { status: 500 }
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
      return shortcode;
    }
  }

  throw new Error(
    `Could not generate unique shortcode after ${maxAttempts} attempts`
  );
}
