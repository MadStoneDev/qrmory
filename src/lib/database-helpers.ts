// lib/database-helpers.ts
import { Database } from "../../database.types";

// Helper type to handle JSONB fields that should be arrays
type SubscriptionPackageRaw =
  Database["public"]["Tables"]["subscription_packages"]["Row"];

export interface SubscriptionPackage
  extends Omit<SubscriptionPackageRaw, "features"> {
  features: string[]; // Override JSONB to be string[]
}

// Helper function to safely parse features from JSONB
export function parseFeatures(features: any): string[] {
  if (Array.isArray(features)) {
    return features.filter((f) => typeof f === "string");
  }
  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed)
        ? parsed.filter((f) => typeof f === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Helper function to format subscription package data
export function formatSubscriptionPackage(
  raw: SubscriptionPackageRaw,
): SubscriptionPackage {
  return {
    ...raw,
    features: parseFeatures(raw.features),
  };
}

// Helper for quota packages if they also have JSONB issues
export function formatQuotaPackage(
  raw: Database["public"]["Tables"]["quota_packages"]["Row"],
) {
  return raw; // No JSONB fields to fix here
}

// Safe way to handle any JSONB array field
export function safeJsonArray<T>(
  value: any,
  validator?: (item: any) => item is T,
): T[] {
  if (Array.isArray(value)) {
    return validator ? value.filter(validator) : value;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return validator ? parsed.filter(validator) : parsed;
      }
    } catch {
      // Fall through to return empty array
    }
  }
  return [];
}
