// src/lib/domain-verification.ts
// Custom domain verification and management utilities

import crypto from "crypto";

// Domain status types
export type DomainStatus = "pending" | "verified" | "failed" | "active";
export type SSLStatus = "pending" | "provisioning" | "active" | "error";

// Custom domain interface (matches database schema)
export interface CustomDomain {
  id: string;
  user_id: string;
  domain: string;
  verification_token: string;
  verified_at: string | null;
  is_active: boolean;
  ssl_status: SSLStatus;
  created_at: string;
  updated_at: string;
}

// Domain with verification status
export interface DomainWithStatus extends CustomDomain {
  status: DomainStatus;
  dns_configured: boolean;
}

// DNS record requirement for verification
export interface DNSRecord {
  type: "TXT" | "CNAME" | "A";
  host: string;
  value: string;
}

// Get the server hostname for CNAME/A records
export const QRMORY_SERVER_HOST = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_TARGET || "qrmory.com";

// Get the DNS records needed for a custom domain
export function getDNSRecords(
  domain: string,
  token: string
): { verification: DNSRecord; routing: DNSRecord } {
  return {
    verification: getVerificationDNSRecord(domain, token),
    routing: {
      type: "CNAME",
      host: domain,
      value: QRMORY_SERVER_HOST,
    },
  };
}

// Generate a unique verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Get the DNS TXT record that needs to be configured
export function getVerificationDNSRecord(
  domain: string,
  token: string
): DNSRecord {
  return {
    type: "TXT",
    host: `_qrmory-verification.${domain}`,
    value: `qrmory-verification=${token}`,
  };
}

// Validate domain format
export function isValidDomain(domain: string): boolean {
  // Basic domain validation regex
  const domainRegex =
    /^(?!:\/\/)([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

  if (!domainRegex.test(domain)) {
    return false;
  }

  // Additional checks
  if (domain.length > 253) {
    return false;
  }

  // Disallow certain reserved/common domains
  const reservedDomains = [
    "localhost",
    "example.com",
    "test.com",
    "qrmory.com",
    "qrmory.io",
  ];

  const domainLower = domain.toLowerCase();
  if (reservedDomains.some((r) => domainLower === r || domainLower.endsWith(`.${r}`))) {
    return false;
  }

  return true;
}

// Normalize domain (remove protocol, www, trailing slashes)
export function normalizeDomain(input: string): string {
  let domain = input.toLowerCase().trim();

  // Remove protocol
  domain = domain.replace(/^https?:\/\//, "");

  // Remove www prefix
  domain = domain.replace(/^www\./, "");

  // Remove trailing slashes and paths
  domain = domain.split("/")[0];

  // Remove port
  domain = domain.split(":")[0];

  return domain;
}

// Verify DNS TXT record (server-side only)
// Note: This requires actual DNS lookup which may not work in all environments
export async function verifyDNSRecord(
  domain: string,
  expectedToken: string
): Promise<{ verified: boolean; error?: string }> {
  const recordHost = `_qrmory-verification.${domain}`;
  const expectedValue = `qrmory-verification=${expectedToken}`;

  try {
    // Use DNS over HTTPS for more reliable lookups
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(recordHost)}&type=TXT`,
      {
        headers: {
          Accept: "application/dns-json",
        },
      }
    );

    if (!response.ok) {
      return {
        verified: false,
        error: "DNS lookup failed. Please ensure your DNS records are configured.",
      };
    }

    const data = await response.json();

    // Check if we got any TXT records
    if (!data.Answer || data.Answer.length === 0) {
      return {
        verified: false,
        error: "No TXT record found. Please add the verification TXT record to your DNS.",
      };
    }

    // Check if any of the TXT records match our expected value
    for (const answer of data.Answer) {
      if (answer.type === 16) {
        // TXT record type
        // TXT records come with quotes, strip them
        const recordValue = answer.data.replace(/^"|"$/g, "");
        if (recordValue === expectedValue) {
          return { verified: true };
        }
      }
    }

    return {
      verified: false,
      error: "TXT record found but value doesn't match. Please check the record value.",
    };
  } catch (error) {
    console.error("DNS verification error:", error);
    return {
      verified: false,
      error: "DNS verification failed. Please try again later.",
    };
  }
}

// Get domain status based on verification state
export function getDomainStatus(domain: CustomDomain): DomainStatus {
  if (domain.is_active && domain.verified_at) {
    return "active";
  }
  if (domain.verified_at) {
    return "verified";
  }
  return "pending";
}

// Maximum domains per subscription level
export const DOMAIN_LIMITS: Record<number, number> = {
  0: 0, // Free - no custom domains
  1: 1, // Explorer - 1 domain
  2: 3, // Creator - 3 domains
  3: 10, // Champion - 10 domains
};

// Check if user can add more domains
export function canAddDomain(
  subscriptionLevel: number,
  currentDomainCount: number
): { allowed: boolean; reason?: string } {
  const limit = DOMAIN_LIMITS[subscriptionLevel] || 0;

  if (limit === 0) {
    return {
      allowed: false,
      reason: "Custom domains require a paid subscription.",
    };
  }

  if (currentDomainCount >= limit) {
    return {
      allowed: false,
      reason: `Your plan allows up to ${limit} custom domain${limit === 1 ? "" : "s"}. Please upgrade or remove an existing domain.`,
    };
  }

  return { allowed: true };
}

// Format domain for display with URL
export function formatDomainURL(domain: string, shortcode: string): string {
  return `https://${domain}/${shortcode}`;
}

// SQL to create the custom_domains table (for reference)
export const CREATE_TABLE_SQL = `
-- Run this in Supabase SQL Editor to create the custom_domains table

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  verification_token VARCHAR(64) NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false,
  ssl_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_custom_domains_user_id ON custom_domains(user_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);

-- Add custom_domain_id column to qr_codes table
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS custom_domain_id UUID REFERENCES custom_domains(id) ON DELETE SET NULL;

-- RLS policies
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own domains"
  ON custom_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own domains"
  ON custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains"
  ON custom_domains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains"
  ON custom_domains FOR DELETE
  USING (auth.uid() = user_id);
`;
