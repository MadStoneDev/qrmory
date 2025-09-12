// components/subscription-overview-paddle.tsx (Updated version)
"use client";

import { useState, useMemo } from "react";
import { formatPrice } from "@/lib/subscription-config";
import {
  IconCalendar,
  IconCreditCard,
  IconTrendingUp,
  IconBolt,
  IconEye,
  IconEyeOff,
  IconExternalLink,
} from "@tabler/icons-react";

interface PaddleSubscriptionOverviewProps {
  mainSubscription: any;
  boosterSubscriptions: any[];
  profile: any;
  totalQuota: number;
  usedQuota: number;
}

export default function PaddleSubscriptionOverview({
  mainSubscription,
  boosterSubscriptions,
  profile,
  totalQuota,
  usedQuota,
}: PaddleSubscriptionOverviewProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate total monthly cost - much simpler with Paddle
  const totalMonthlyCost = useMemo(() => {
    let total = 0;

    // Add main subscription cost (you can store price in DB or fetch from Paddle API)
    if (mainSubscription?.price_cents) {
      total += mainSubscription.price_cents;
    }

    // Add booster costs
    boosterSubscriptions.forEach((sub) => {
      total += sub.price_cents || 0;
    });

    return total;
  }, [mainSubscription, boosterSubscriptions]);

  const nextBillingDate = useMemo(() => {
    if (!mainSubscription?.current_period_end) return null;
    return new Date(mainSubscription.current_period_end);
  }, [mainSubscription]);

  // Simple function to open Paddle billing portal
  const openBillingPortal = async () => {
    try {
      const response = await fetch("/api/paddle/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: mainSubscription?.paddle_subscription_id,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, "_blank");
      } else {
        console.error("Failed to create portal session");
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-qrmory-purple-800 to-qrmory-purple-600 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold mb-2">Subscription Overview</h2>
            <p className="text-qrmory-purple-100">
              Manage all your active subscriptions in one place
            </p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={showDetails ? "Hide details" : "Show details"}
          >
            {showDetails ? <IconEyeOff size={20} /> : <IconEye size={20} />}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Cost */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconCreditCard className="text-green-600" size={20} />
            <span className="font-medium text-green-800">Monthly Cost</span>
          </div>
          <p className="text-2xl font-bold text-green-800">
            {formatPrice(totalMonthlyCost)}
          </p>
          <p className="text-sm text-green-600">
            {boosterSubscriptions.length > 0
              ? `${1 + boosterSubscriptions.length} active subscriptions`
              : "1 active subscription"}
          </p>
        </div>

        {/* Quota Usage */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconTrendingUp className="text-blue-600" size={20} />
            <span className="font-medium text-blue-800">Quota Usage</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">
            {Math.round((usedQuota / totalQuota) * 100)}%
          </p>
          <p className="text-sm text-blue-600">
            {usedQuota} of {totalQuota} QR codes used
          </p>
        </div>

        {/* Next Billing */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconCalendar className="text-orange-600" size={20} />
            <span className="font-medium text-orange-800">Next Billing</span>
          </div>
          <p className="text-lg font-bold text-orange-800">
            {nextBillingDate
              ? nextBillingDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </p>
          <p className="text-sm text-orange-600">
            {nextBillingDate
              ? `${Math.ceil(
                  (nextBillingDate.getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                )} days`
              : "No active billing"}
          </p>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-800 mb-4">
            Active Subscriptions
          </h3>

          {/* Main Subscription */}
          {mainSubscription && (
            <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-neutral-800">
                    {mainSubscription.plan_name || "Main Subscription"}
                  </h4>
                  <p className="text-sm text-neutral-600">
                    Status:{" "}
                    <span className="font-medium">
                      {mainSubscription.status}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-600">
                    Includes: {profile.dynamic_qr_quota} QR codes
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-800">
                    {formatPrice(mainSubscription.price_cents || 0)}
                  </p>
                  <p className="text-sm text-neutral-600">per month</p>
                </div>
              </div>
            </div>
          )}

          {/* Booster Subscriptions */}
          {boosterSubscriptions.map((booster, index) => (
            <div key={booster.id} className="mb-4 p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <IconBolt className="text-orange-600" size={16} />
                    <h4 className="font-medium text-orange-800">
                      {booster.plan_name || `Booster ${index + 1}`}
                    </h4>
                  </div>
                  <p className="text-sm text-orange-600">
                    Status:{" "}
                    <span className="font-medium">{booster.status}</span>
                  </p>
                  <p className="text-sm text-orange-600">
                    Extra QR codes added to quota
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-800">
                    {formatPrice(booster.price_cents || 0)}
                  </p>
                  <p className="text-sm text-orange-600">per month</p>
                </div>
              </div>
            </div>
          ))}

          {/* Much simpler management - just one button */}
          <div className="mt-6">
            <button
              onClick={openBillingPortal}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-qrmory-purple-800 text-white rounded-lg hover:bg-qrmory-purple-700 transition-colors"
            >
              <IconExternalLink size={16} />
              Manage Billing with Paddle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
