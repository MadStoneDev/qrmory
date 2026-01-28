// src/app/api/domains/check/route.ts
// API endpoint for Caddy on-demand TLS verification
// Caddy calls this before provisioning SSL for a domain

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Main domains that are always allowed
const ALLOWED_DOMAINS = [
  "qrmory.com",
  "www.qrmory.com",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return new NextResponse("Missing domain parameter", { status: 400 });
  }

  const normalizedDomain = domain.toLowerCase().replace(/:\d+$/, "");

  // Always allow main domains
  if (ALLOWED_DOMAINS.includes(normalizedDomain)) {
    return new NextResponse("OK", { status: 200 });
  }

  // Check if this is a registered and active custom domain
  try {
    const supabase = await createClient();

    const { data: customDomain } = await supabase
      .from("custom_domains")
      .select("id, is_active")
      .eq("domain", normalizedDomain)
      .single();

    if (customDomain && customDomain.is_active) {
      return new NextResponse("OK", { status: 200 });
    }
  } catch (error) {
    console.error("Domain check error:", error);
  }

  // Domain not found or not active - deny SSL provisioning
  return new NextResponse("Domain not allowed", { status: 404 });
}
