"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { shortcode } = body;

    if (!shortcode) {
      return NextResponse.json(
        { error: "Shortcode is required" },
        { status: 400 },
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // First, get the QR code info
    const { data: qrCode, error: qrError } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("shortcode", shortcode)
      .single();

    if (qrError || !qrCode) {
      console.error("Error finding QR code:", qrError);
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // Get country from request headers (geo is no longer on NextRequest in Next.js 16+)
    const countryCode = req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      "Unknown";

    // Parse user agent
    const userAgent = req.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const browserInfo = parser.getBrowser();
    const deviceInfo = parser.getDevice();

    // Determine device type
    let deviceType = "desktop";
    if (deviceInfo.type) {
      deviceType = deviceInfo.type;
    } else if (userAgent.toLowerCase().includes("mobile")) {
      deviceType = "mobile";
    }

    // Get referrer
    const referrer = req.headers.get("referer") || null;

    // Log the scan
    const { error: insertError } = await supabase
      .from("qr_code_analytics")
      .insert({
        qr_code_id: qrCode.id,
        user_agent: userAgent,
        country: countryCode,
        device_type: deviceType,
        browser: browserInfo.name || "Unknown",
        referrer: referrer,
      });

    if (insertError) {
      console.error("Error logging scan:", insertError);
      return NextResponse.json(
        { error: "Failed to log scan" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
