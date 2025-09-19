// /api/debug/subscription-data/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Test subscription packages
    const { data: packages, error: packagesError } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true);

    // Check for missing paddle_price_ids
    const packagesWithoutPaddle =
      packages?.filter((p) => !p.paddle_price_id) || [];

    return NextResponse.json({
      auth: {
        user: user ? { id: user.id, email: user.email } : null,
        error: authError,
      },
      packages: {
        data: packages,
        error: packagesError,
        count: packages?.length || 0,
        missingPaddleIds: packagesWithoutPaddle,
      },
      environment: {
        hasVendorId: !!process.env.PADDLE_VENDOR_ID,
        hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
