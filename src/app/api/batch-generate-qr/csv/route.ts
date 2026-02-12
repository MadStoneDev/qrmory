// app/api/batch-generate-qr/csv/route.ts
// API endpoint for batch QR code generation from CSV imports

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateShortCode } from "@/utils/general";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  enableAutoPipelining: false,
});

// Batch limits by subscription level
const BATCH_LIMITS = {
  0: 0, // Free - no batch generation
  1: 10, // Explorer
  2: 25, // Creator
  3: 50, // Champion
};

// Quota limits by subscription level
const QUOTA_LIMITS = {
  0: 3, // Free
  1: 25, // Explorer
  2: 100, // Creator
  3: 500, // Champion
};

interface CSVQRCode {
  name: string;
  value: string;
  rowIndex: number;
}

interface CSVBatchRequestBody {
  codes: CSVQRCode[];
  qrType?: string;
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
    const body: CSVBatchRequestBody = await request.json();
    const { codes, qrType = "website" } = body;

    // Validate inputs
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        { error: "No QR codes provided" },
        { status: 400 }
      );
    }

    // Check batch limit
    if (codes.length > batchLimit) {
      return NextResponse.json(
        {
          error: `Your plan allows up to ${batchLimit} QR codes per batch. Requested: ${codes.length}`,
          limit: batchLimit,
          upgradeRequired: true,
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

    const quotaLimit = QUOTA_LIMITS[subscriptionLevel];
    const currentCount = existingCount || 0;

    if (currentCount + codes.length > quotaLimit) {
      return NextResponse.json(
        {
          error: `Adding ${codes.length} codes would exceed your quota. Current: ${currentCount}/${quotaLimit}`,
          currentCount,
          quotaLimit,
          requested: codes.length,
          upgradeRequired: true,
        },
        { status: 400 }
      );
    }

    // Generate unique shortcodes and create QR codes
    const createdCodes: Array<{
      id: string;
      name: string;
      shortcode: string;
      value: string;
      url: string;
      rowIndex: number;
    }> = [];

    const errors: Array<{
      name: string;
      rowIndex: number;
      error: string;
    }> = [];

    for (const item of codes) {
      // Validate each item
      if (!item.value || item.value.trim().length === 0) {
        errors.push({
          name: item.name || "Unknown",
          rowIndex: item.rowIndex,
          error: "Value is empty",
        });
        continue;
      }

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
            origin: "csv_batch_generation",
          })
        );

        // Insert into database
        const { data, error: insertError } = await supabase
          .from("qr_codes")
          .insert({
            user_id: user.id,
            type: "dynamic",
            title: item.name || `QR Code ${item.rowIndex}`,
            qr_value: item.value,
            shortcode: shortcode,
            is_active: true,
            content: {
              controlType: qrType,
              csvImported: true,
              rowIndex: item.rowIndex,
              creatorId: user.id,
            },
          })
          .select("id")
          .single();

        if (insertError) {
          console.error(`CSV batch insert error for row ${item.rowIndex}:`, insertError.message);
          errors.push({
            name: item.name || "Unknown",
            rowIndex: item.rowIndex,
            error: "Failed to create QR code. Please check the data format.",
          });
          // Release the shortcode reservation on error
          await redis.del(`reserved:${shortcode}`);
        } else {
          createdCodes.push({
            id: data.id,
            name: item.name || `QR Code ${item.rowIndex}`,
            shortcode,
            value: item.value,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${shortcode}`,
            rowIndex: item.rowIndex,
          });
        }
      } catch (err) {
        console.error(`CSV batch error for row ${item.rowIndex}:`, err);
        errors.push({
          name: item.name || "Unknown",
          rowIndex: item.rowIndex,
          error: "An unexpected error occurred while creating this QR code.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      created: createdCodes.length,
      total: codes.length,
      codes: createdCodes,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("CSV batch generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR codes from CSV" },
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
