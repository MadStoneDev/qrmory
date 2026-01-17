// lib/subscription-validation.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";

export interface SubscriptionStatus {
  isActive: boolean;
  subscriptionLevel: number;
  subscriptionStatus: string | null;
  dynamicQrQuota: number;
  currentPeriodEnd: string | null;
  needsRevalidation: boolean;
}

export interface SubscriptionValidationResult {
  isValid: boolean;
  status: SubscriptionStatus;
  error?: string;
}

const SUBSCRIPTION_ACTIVE_STATUSES = ["active", "trialing"];

/**
 * Validates a user's subscription status
 * Returns detailed subscription information and whether it's valid
 */
export async function validateSubscription(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<SubscriptionValidationResult> {
  try {
    // Get profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_level, subscription_status, dynamic_qr_quota")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return {
        isValid: false,
        status: {
          isActive: false,
          subscriptionLevel: 0,
          subscriptionStatus: null,
          dynamicQrQuota: 3,
          currentPeriodEnd: null,
          needsRevalidation: true,
        },
        error: "Profile not found",
      };
    }

    // Get subscription details
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .single();

    const subscriptionStatus = subscription?.status || profile.subscription_status;
    const isActive = subscriptionStatus
      ? SUBSCRIPTION_ACTIVE_STATUSES.includes(subscriptionStatus)
      : profile.subscription_level === 0; // Free tier is always "active"

    // Check if subscription has expired
    const currentPeriodEnd = subscription?.current_period_end;
    const hasExpired = currentPeriodEnd
      ? new Date(currentPeriodEnd) < new Date()
      : false;

    // Determine if we need to sync with payment provider
    const needsRevalidation = hasExpired && isActive;

    return {
      isValid: isActive && !hasExpired,
      status: {
        isActive: isActive && !hasExpired,
        subscriptionLevel: profile.subscription_level || 0,
        subscriptionStatus: subscriptionStatus,
        dynamicQrQuota: profile.dynamic_qr_quota || 3,
        currentPeriodEnd: currentPeriodEnd || null,
        needsRevalidation,
      },
    };
  } catch (error) {
    console.error("Error validating subscription:", error);
    return {
      isValid: false,
      status: {
        isActive: false,
        subscriptionLevel: 0,
        subscriptionStatus: null,
        dynamicQrQuota: 3,
        currentPeriodEnd: null,
        needsRevalidation: true,
      },
      error: "Validation error",
    };
  }
}

/**
 * Checks if a user has access to a specific feature based on their subscription level
 */
export function hasFeatureAccess(
  subscriptionLevel: number,
  requiredLevel: number
): boolean {
  return subscriptionLevel >= requiredLevel;
}

/**
 * Gets the features available for a subscription level
 */
export function getSubscriptionFeatures(level: number) {
  const features = {
    0: {
      name: "Free",
      dynamicQrCodes: 3,
      storage: "50MB",
      audioUpload: false,
      videoUpload: false,
      analytics: false,
      customBranding: false,
      brandedRedirect: true, // Shows QRmory branding on redirect
      instantRedirect: false,
      prioritySupport: false,
    },
    1: {
      name: "Explorer",
      dynamicQrCodes: 10,
      storage: "500MB",
      audioUpload: true,
      videoUpload: false,
      analytics: true,
      customBranding: false,
      brandedRedirect: true, // Shows QRmory branding on redirect
      instantRedirect: false,
      prioritySupport: false,
    },
    2: {
      name: "Creator",
      dynamicQrCodes: 50,
      storage: "2GB",
      audioUpload: true,
      videoUpload: true,
      analytics: true,
      customBranding: true,
      brandedRedirect: false, // No QRmory branding
      instantRedirect: true, // Instant redirect, no delay
      prioritySupport: false,
    },
    3: {
      name: "Champion",
      dynamicQrCodes: 250,
      storage: "10GB",
      audioUpload: true,
      videoUpload: true,
      analytics: true,
      customBranding: true,
      brandedRedirect: false, // No QRmory branding
      instantRedirect: true, // Instant redirect, no delay
      prioritySupport: true,
    },
  };

  return features[level as keyof typeof features] || features[0];
}

/**
 * Check if a subscription level shows branded redirect page
 */
export function showsBrandedRedirect(level: number): boolean {
  return level < 2; // Free (0) and Explorer (1) show branding
}

/**
 * Check if user can create more dynamic QR codes
 */
export async function canCreateDynamicQR(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ canCreate: boolean; currentCount: number; maxQuota: number; message?: string }> {
  try {
    // Get user's quota
    const { data: profile } = await supabase
      .from("profiles")
      .select("dynamic_qr_quota")
      .eq("id", userId)
      .single();

    const maxQuota = profile?.dynamic_qr_quota || 3;

    // Count current dynamic QR codes
    const { count } = await supabase
      .from("qr_codes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "dynamic");

    const currentCount = count || 0;

    if (currentCount >= maxQuota) {
      return {
        canCreate: false,
        currentCount,
        maxQuota,
        message: `You've reached your limit of ${maxQuota} dynamic QR codes. Upgrade to create more.`,
      };
    }

    return {
      canCreate: true,
      currentCount,
      maxQuota,
    };
  } catch (error) {
    console.error("Error checking dynamic QR quota:", error);
    return {
      canCreate: false,
      currentCount: 0,
      maxQuota: 3,
      message: "Unable to verify quota. Please try again.",
    };
  }
}
