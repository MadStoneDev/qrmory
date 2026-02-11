// src/app/api/admin/coolify-status/route.ts
// Admin endpoint to check Coolify domain configuration
// Requires authentication and checks user is admin

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCurrentDomains } from "@/lib/coolify-api";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  // Check authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin via env-based allowlist
  if (!isAdmin(user.id)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    // Get domains from Coolify
    const coolifyDomains = await getCurrentDomains();

    // Get domains from database
    const { data: dbDomains } = await supabase
      .from("custom_domains")
      .select("domain, is_active, verified_at, ssl_status")
      .eq("is_active", true);

    // Fetch full app info from Coolify for SSL status
    const apiUrl = process.env.COOLIFY_API_URL;
    const apiToken = process.env.COOLIFY_API_TOKEN;
    const appUuid = process.env.COOLIFY_APP_UUID;

    let appInfo = null;
    if (apiUrl && apiToken && appUuid) {
      const response = await fetch(`${apiUrl}/applications/${appUuid}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const app = await response.json();
        appInfo = {
          name: app.name,
          fqdn: app.fqdn,
          status: app.status,
          // Traefik handles SSL automatically for configured domains
          sslNote: "Traefik auto-provisions SSL via Let's Encrypt for all configured domains",
        };
      }
    }

    return NextResponse.json({
      success: true,
      coolifyDomains,
      databaseDomains: dbDomains || [],
      appInfo,
      syncStatus: {
        inCoolify: coolifyDomains.length,
        inDatabase: dbDomains?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
