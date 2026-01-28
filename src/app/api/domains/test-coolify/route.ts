// src/app/api/domains/test-coolify/route.ts
// Temporary endpoint to test Coolify API connection
// DELETE THIS FILE after testing

import { NextResponse } from "next/server";
import { getCurrentDomains } from "@/lib/coolify-api";

export async function GET() {
  const apiUrl = process.env.COOLIFY_API_URL;
  const apiToken = process.env.COOLIFY_API_TOKEN;
  const appUuid = process.env.COOLIFY_APP_UUID;

  // Check if env vars are set
  const envCheck = {
    COOLIFY_API_URL: apiUrl ? `✓ Set (${apiUrl})` : "✗ Missing",
    COOLIFY_API_TOKEN: apiToken ? `✓ Set (${apiToken.slice(0, 8)}...)` : "✗ Missing",
    COOLIFY_APP_UUID: appUuid ? `✓ Set (${appUuid})` : "✗ Missing",
  };

  if (!apiUrl || !apiToken || !appUuid) {
    return NextResponse.json({
      success: false,
      message: "Missing environment variables",
      envCheck,
    });
  }

  try {
    // Try to fetch current domains
    const domains = await getCurrentDomains();

    return NextResponse.json({
      success: true,
      message: "Coolify API connection successful!",
      envCheck,
      currentDomains: domains,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Coolify API connection failed",
      envCheck,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
