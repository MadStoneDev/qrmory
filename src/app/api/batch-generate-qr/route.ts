// app/api/batch-generate-qr/route.ts
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

    // Generate all unique shortcodes in batch
    const shortcodes = await generateBatchShortcodes(batchItems.length, supabase);

    // Reserve all shortcodes in Redis with a single pipeline
    const pipeline = redis.pipeline();
    const reservationData = JSON.stringify({
      userId: user.id,
      reservedAt: Date.now(),
      origin: "batch_generation",
    });
    for (const code of shortcodes) {
      pipeline.setex(`reserved:${code}`, 300, reservationData);
    }
    await pipeline.exec();

    // Batch insert all QR codes at once
    const insertRows = batchItems.map((item, i) => ({
      user_id: user.id,
      type: "dynamic" as const,
      title: item.name,
      qr_value: item.value,
      shortcode: shortcodes[i],
      is_active: true,
      content: {
        controlType: qrType,
        batchGenerated: true,
        batchPattern: pattern,
        creatorId: user.id,
      },
    }));

    const { data: insertedRows, error: insertError } = await supabase
      .from("qr_codes")
      .insert(insertRows)
      .select("id, title, shortcode, qr_value");

    if (insertError) {
      // Release all shortcode reservations on error
      const cleanupPipeline = redis.pipeline();
      for (const code of shortcodes) {
        cleanupPipeline.del(`reserved:${code}`);
      }
      await cleanupPipeline.exec();

      return NextResponse.json(
        { error: "Failed to insert QR codes" },
        { status: 500 }
      );
    }

    const createdCodes = (insertedRows || []).map((row) => ({
      id: row.id,
      name: row.title,
      shortcode: row.shortcode,
      value: row.qr_value,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${row.shortcode}`,
    }));

    return NextResponse.json({
      success: true,
      created: createdCodes.length,
      total: batchItems.length,
      codes: createdCodes,
    });
  } catch (error) {
    console.error("Batch generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate batch QR codes" },
      { status: 500 }
    );
  }
}

async function generateBatchShortcodes(
  count: number,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string[]> {
  const shortcodes: string[] = [];
  const candidates: string[] = [];

  // Generate more candidates than needed to account for collisions
  const candidateCount = Math.ceil(count * 1.5);
  for (let i = 0; i < candidateCount; i++) {
    candidates.push(generateShortCode(8));
  }

  // Batch check Redis reservations
  const pipeline = redis.pipeline();
  for (const code of candidates) {
    pipeline.exists(`reserved:${code}`);
  }
  const redisResults = await pipeline.exec();

  // Filter out reserved shortcodes
  const unreserved = candidates.filter(
    (_, i) => redisResults[i] === 0
  );

  // Batch check database for existing shortcodes
  const { data: existing } = await supabase
    .from("qr_codes")
    .select("shortcode")
    .in("shortcode", unreserved);

  const existingSet = new Set(
    (existing || []).map((r) => r.shortcode)
  );

  for (const code of unreserved) {
    if (!existingSet.has(code)) {
      shortcodes.push(code);
      if (shortcodes.length >= count) break;
    }
  }

  // If we still don't have enough, generate more individually
  while (shortcodes.length < count) {
    const code = generateShortCode(9); // Use longer code to reduce collisions
    const isReserved = await redis.exists(`reserved:${code}`);
    if (isReserved) continue;

    const { data } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("shortcode", code)
      .single();

    if (!data) {
      shortcodes.push(code);
    }
  }

  return shortcodes;
}
