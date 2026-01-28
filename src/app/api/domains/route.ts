// src/app/api/domains/route.ts
// API endpoint for custom domain management

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  generateVerificationToken,
  isValidDomain,
  normalizeDomain,
  getVerificationDNSRecord,
  canAddDomain,
  DOMAIN_LIMITS,
} from "@/lib/domain-verification";
import { removeDomainFromCoolify } from "@/lib/coolify-api";

// GET - List user's custom domains
export async function GET() {
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

    // Get user's subscription level
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_level")
      .eq("id", user.id)
      .single();

    const subscriptionLevel = profile?.subscription_level || 0;
    const limit = DOMAIN_LIMITS[subscriptionLevel] || 0;

    // Get user's domains
    const { data: domains, error } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      // Table might not exist yet
      if (error.code === "42P01") {
        return NextResponse.json({
          success: true,
          domains: [],
          limit,
          subscriptionLevel,
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      domains: domains || [],
      limit,
      subscriptionLevel,
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}

// POST - Add a new custom domain
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
    const { domain: rawDomain } = body as { domain: string };

    if (!rawDomain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Normalize and validate domain
    const domain = normalizeDomain(rawDomain);

    if (!isValidDomain(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Get user's subscription level and current domain count
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_level")
      .eq("id", user.id)
      .single();

    const subscriptionLevel = profile?.subscription_level || 0;

    // Count existing domains
    const { count } = await supabase
      .from("custom_domains")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const currentCount = count || 0;

    // Check if user can add more domains
    const check = canAddDomain(subscriptionLevel, currentCount);
    if (!check.allowed) {
      return NextResponse.json(
        {
          error: check.reason,
          upgradeRequired: subscriptionLevel === 0,
        },
        { status: 403 }
      );
    }

    // Check if domain is already registered
    const { data: existingDomain } = await supabase
      .from("custom_domains")
      .select("id, user_id")
      .eq("domain", domain)
      .single();

    if (existingDomain) {
      if (existingDomain.user_id === user.id) {
        return NextResponse.json(
          { error: "You have already added this domain" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "This domain is already registered by another user" },
          { status: 400 }
        );
      }
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Insert the domain
    const { data: newDomain, error: insertError } = await supabase
      .from("custom_domains")
      .insert({
        user_id: user.id,
        domain,
        verification_token: verificationToken,
        is_active: false,
        ssl_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting domain:", insertError);
      return NextResponse.json(
        { error: "Failed to add domain" },
        { status: 500 }
      );
    }

    // Return the domain with DNS record instructions
    const dnsRecord = getVerificationDNSRecord(domain, verificationToken);

    return NextResponse.json({
      success: true,
      domain: newDomain,
      dnsRecord,
      instructions: `Add a TXT record to your DNS with host "${dnsRecord.host}" and value "${dnsRecord.value}"`,
    });
  } catch (error) {
    console.error("Error adding domain:", error);
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a custom domain
export async function DELETE(request: NextRequest) {
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

    // Get the domain first (we need the domain name for Coolify)
    const { data: domainToDelete } = await supabase
      .from("custom_domains")
      .select("domain")
      .eq("id", domainId)
      .eq("user_id", user.id)
      .single();

    // Delete from database
    const { error: deleteError } = await supabase
      .from("custom_domains")
      .delete()
      .eq("id", domainId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting domain:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete domain" },
        { status: 500 }
      );
    }

    // Remove from Coolify/Traefik
    if (domainToDelete?.domain) {
      const coolifyResult = await removeDomainFromCoolify(domainToDelete.domain);
      if (!coolifyResult.success) {
        console.error("Failed to remove domain from Coolify:", coolifyResult.error);
        // Don't fail - domain is deleted from our DB
      }
    }

    // Also clear custom_domain_id from any QR codes using this domain
    await supabase
      .from("qr_codes")
      .update({ custom_domain_id: null })
      .eq("custom_domain_id", domainId);

    return NextResponse.json({
      success: true,
      message: "Domain deleted",
    });
  } catch (error) {
    console.error("Error deleting domain:", error);
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    );
  }
}
