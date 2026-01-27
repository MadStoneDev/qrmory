// src/app/api/domains/verify/route.ts
// API endpoint for verifying custom domain DNS configuration

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyDNSRecord, getVerificationDNSRecord } from "@/lib/domain-verification";

// POST - Verify domain DNS configuration
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { domainId } = body as { domainId: string };

    if (!domainId) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 }
      );
    }

    // Get the domain
    const { data: domain, error: fetchError } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Already verified?
    if (domain.verified_at && domain.is_active) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: "Domain is already verified and active",
        domain,
      });
    }

    // Perform DNS verification
    const result = await verifyDNSRecord(domain.domain, domain.verification_token);

    if (!result.verified) {
      // Get the expected DNS record for the response
      const dnsRecord = getVerificationDNSRecord(domain.domain, domain.verification_token);

      return NextResponse.json({
        success: false,
        verified: false,
        error: result.error,
        dnsRecord,
        instructions: `Please add a TXT record to your DNS:\nHost: ${dnsRecord.host}\nValue: ${dnsRecord.value}`,
      });
    }

    // Update the domain as verified
    const { data: updatedDomain, error: updateError } = await supabase
      .from("custom_domains")
      .update({
        verified_at: new Date().toISOString(),
        is_active: true,
        ssl_status: "active", // In a real implementation, you'd provision SSL here
        updated_at: new Date().toISOString(),
      })
      .eq("id", domainId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating domain:", updateError);
      return NextResponse.json(
        { error: "Failed to update domain status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Domain verified successfully! Your custom domain is now active.",
      domain: updatedDomain,
    });
  } catch (error) {
    console.error("Error verifying domain:", error);
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    );
  }
}

// GET - Check verification status without updating
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("id");

    if (!domainId) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 }
      );
    }

    // Get the domain
    const { data: domain, error: fetchError } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Check current DNS status
    const result = await verifyDNSRecord(domain.domain, domain.verification_token);
    const dnsRecord = getVerificationDNSRecord(domain.domain, domain.verification_token);

    return NextResponse.json({
      success: true,
      domain,
      dnsConfigured: result.verified,
      dnsRecord,
      status: domain.is_active ? "active" : domain.verified_at ? "verified" : "pending",
    });
  } catch (error) {
    console.error("Error checking domain status:", error);
    return NextResponse.json(
      { error: "Failed to check domain status" },
      { status: 500 }
    );
  }
}
