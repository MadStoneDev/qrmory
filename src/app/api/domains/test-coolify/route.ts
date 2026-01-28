// src/app/api/domains/test-coolify/route.ts
// Temporary endpoint to test Coolify API connection
// DELETE THIS FILE after testing

import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.COOLIFY_API_URL;
  const apiToken = process.env.COOLIFY_API_TOKEN;
  const appUuid = process.env.COOLIFY_APP_UUID;

  const envCheck = {
    COOLIFY_API_URL: apiUrl ? `✓ Set (${apiUrl})` : "✗ Missing",
    COOLIFY_API_TOKEN: apiToken ? `✓ Set (${apiToken.slice(0, 8)}...)` : "✗ Missing",
    COOLIFY_APP_UUID: appUuid ? `✓ Set (${appUuid})` : "✗ Missing",
  };

  if (!apiUrl || !apiToken) {
    return NextResponse.json({
      success: false,
      message: "Missing environment variables",
      envCheck,
    });
  }

  try {
    // First, list all applications to find the correct UUID
    const listResponse = await fetch(`${apiUrl}/applications`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!listResponse.ok) {
      return NextResponse.json({
        success: false,
        message: "Failed to list applications",
        status: listResponse.status,
        error: await listResponse.text(),
      });
    }

    const allApps = await listResponse.json();

    // Extract relevant info from each app
    const appList = (Array.isArray(allApps) ? allApps : [allApps]).map((app: any) => ({
      uuid: app.uuid,
      name: app.name,
      fqdn: app.fqdn,
      description: app.description,
    }));

    // Try to fetch the specific app if UUID is provided
    let specificApp = null;
    if (appUuid) {
      const appResponse = await fetch(`${apiUrl}/applications/${appUuid}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      });

      if (appResponse.ok) {
        specificApp = await appResponse.json();
      } else {
        specificApp = {
          error: `Failed to fetch (${appResponse.status})`,
          hint: "Check if UUID matches one from the list below"
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Coolify API working",
      envCheck,
      configuredUuid: appUuid,
      allApplications: appList,
      specificAppResult: specificApp,
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
