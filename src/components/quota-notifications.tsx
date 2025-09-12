"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SUBSCRIPTION_LEVELS } from "@/lib/subscription-config";
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";

type QuotaNotificationProps = {
  qrType: "static" | "dynamic";
  forceShow?: boolean;
};

// Define types for the data structures
interface Profile {
  subscription_level?: string | null;
  dynamic_qr_quota?: number | null;
}

interface QuotaData {
  usedDynamicQRs: number;
  totalQuota: number;
  subscriptionLevel: string;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

export default function QuotaNotification({
  qrType,
  forceShow = false,
}: QuotaNotificationProps) {
  const [loading, setLoading] = useState(true);
  const [quotaData, setQuotaData] = useState<QuotaData>({
    usedDynamicQRs: 0,
    totalQuota: 3, // Default free quota
    subscriptionLevel: "Free",
    isNearLimit: false,
    isAtLimit: false,
  });

  useEffect(() => {
    async function fetchQuotaData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Get profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_level, dynamic_qr_quota")
          .eq("id", user.id)
          .single();

        if (!profile) {
          setLoading(false);
          return;
        }

        const typedProfile = profile as Profile;

        // Count used dynamic QR codes
        const { count: usedDynamicQRs } = await supabase
          .from("qr_codes")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("type", "dynamic");

        // Calculate quota based on subscription level
        let baseQuota = 3; // Default free quota
        if (typedProfile.subscription_level === "1") baseQuota = 10;
        if (typedProfile.subscription_level === "2") baseQuota = 50;
        if (typedProfile.subscription_level === "3") baseQuota = 250;

        // Total quota = base quota + additional quota
        const totalQuota = baseQuota + (typedProfile.dynamic_qr_quota || 0);
        const usedCount = usedDynamicQRs || 0;

        // Check limits (80% = near limit, 100% = at limit)
        const isNearLimit =
          usedCount >= totalQuota * 0.8 && usedCount < totalQuota;
        const isAtLimit = usedCount >= totalQuota;

        setQuotaData({
          usedDynamicQRs: usedCount,
          totalQuota,
          subscriptionLevel:
            SUBSCRIPTION_LEVELS[
              typedProfile.subscription_level as keyof typeof SUBSCRIPTION_LEVELS
            ] || "Free",
          isNearLimit,
          isAtLimit,
        });
      } catch (error) {
        console.error("Error fetching quota data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotaData();
  }, []);

  // Only show for dynamic QR codes or when forced
  if (qrType === "static" && !forceShow) return null;

  // Don't show while loading unless forced
  if (loading && !forceShow) return null;

  // Show warning notification when near limit
  if (quotaData.isNearLimit) {
    return (
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
        <IconAlertTriangle
          size={24}
          className="text-amber-500 flex-shrink-0 mr-3 mt-0.5"
        />
        <div>
          <h4 className="font-medium text-amber-800">
            You're running low on QR codes
          </h4>
          <p className="text-amber-700 mt-1">
            You've used {quotaData.usedDynamicQRs} of your{" "}
            {quotaData.totalQuota} dynamic QR codes.
            {quotaData.subscriptionLevel === "Free" ? (
              <span> Upgrade your plan to create more.</span>
            ) : (
              <span> Purchase a booster package to add more capacity.</span>
            )}
          </p>
          <Link
            href={`/dashboard/subscription`}
            className="inline-flex items-center text-amber-800 font-medium mt-2 hover:underline"
          >
            View options <IconArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  // Show error notification when at limit
  if (quotaData.isAtLimit) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
        <IconAlertTriangle
          size={24}
          className="text-red-500 flex-shrink-0 mr-3 mt-0.5"
        />
        <div>
          <h4 className="font-medium text-red-800">
            Dynamic QR code limit reached
          </h4>
          <p className="text-red-700 mt-1">
            You've used all {quotaData.totalQuota} of your dynamic QR codes.
            {quotaData.subscriptionLevel === "Free" ? (
              <span> Upgrade your plan to create more QR codes.</span>
            ) : (
              <span> Purchase a booster package to add more capacity.</span>
            )}
          </p>
          <Link
            href={`/dashboard/subscription`}
            className="inline-flex items-center text-red-800 font-medium mt-2 hover:underline"
          >
            Upgrade now <IconArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  // Show standard info when forced but not at or near limit
  if (forceShow) {
    return (
      <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start">
        <IconInfoCircle
          size={24}
          className="text-qrmory-purple-800 flex-shrink-0 mr-3 mt-0.5"
        />
        <div>
          <h4 className="font-medium text-neutral-800">
            Dynamic QR code usage
          </h4>
          <p className="text-neutral-700 mt-1">
            You've used {quotaData.usedDynamicQRs} of your{" "}
            {quotaData.totalQuota} dynamic QR codes on your{" "}
            {quotaData.subscriptionLevel} plan.
          </p>
          <Link
            href={`/dashboard/subscription`}
            className="inline-flex items-center text-qrmory-purple-800 font-medium mt-2 hover:underline"
          >
            View subscription options{" "}
            <IconArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  // Default: return null
  return null;
}
