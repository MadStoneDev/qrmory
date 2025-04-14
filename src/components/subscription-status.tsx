﻿"use client";

import { useState } from "react";

import { QuotaInfo } from "@/lib/subscription-config";
import { createClient } from "@/utils/supabase/client";

import { toast } from "sonner";
import { IconLoader2, IconExternalLink } from "@tabler/icons-react";

type SubscriptionStatusProps = {
  profile: any;
  subscription: any | null;
  currentQuota: QuotaInfo;
  usedDynamicQRs: number;
};

export default function SubscriptionStatus({
  profile,
  subscription,
  currentQuota,
  usedDynamicQRs,
}: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(false);

  const totalQuota = profile.dynamic_qr_quota + currentQuota.dynamicCodes;
  const usagePercentage = Math.min(
    100,
    Math.round((usedDynamicQRs / totalQuota) * 100),
  );

  // Function to format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleManageSubscription = async () => {
    if (!subscription) return;

    try {
      setLoading(true);
      const supabase = createClient();

      // Create a portal session
      const response = await fetch("/api/create-stripe-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: subscription.stripe_subscription_id,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create portal session");

      // Redirect to Stripe portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast("Error accessing subscription management", {
        description: "Something went wrong. Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-lg font-bold text-qrmory-purple-800">
            Current Plan: <span>{currentQuota.subscription}</span>
          </h2>

          {subscription && (
            <p className="text-sm text-neutral-600 mt-1">
              {subscription.status === "active"
                ? `Renews on ${formatDate(subscription.current_period_end)}`
                : `Subscription status: ${subscription.status}`}
            </p>
          )}
        </div>

        {subscription && (
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="mt-4 md:mt-0 py-2 px-4 rounded-md transition-colors border border-qrmory-purple-800 text-qrmory-purple-800 hover:bg-qrmory-purple-100 flex items-center"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                Manage Subscription
                <IconExternalLink size={16} className="ml-2" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-neutral-700">
            Dynamic QR Codes Usage
          </p>
          <p className="text-sm text-neutral-600">
            {usedDynamicQRs} / {totalQuota}
          </p>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2.5">
          <div
            className="bg-qrmory-purple-800 h-2.5 rounded-full"
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-50 p-4 rounded-md">
            <p className="text-sm font-medium text-neutral-700">Plan Quota</p>
            <p className="text-2xl font-bold text-qrmory-purple-800">
              {currentQuota.dynamicCodes}
            </p>
            <p className="text-xs text-neutral-500">
              Dynamic QR codes from your subscription
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-md">
            <p className="text-sm font-medium text-neutral-700">
              Additional Quota
            </p>
            <p className="text-2xl font-bold text-qrmory-purple-800">
              {profile.extra_quota_from_boosters}
            </p>
            <p className="text-xs text-neutral-500">
              Extra QR codes from boosters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
