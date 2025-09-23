// subscription-status.tsx - FIXED error handling and edge cases
"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  IconLoader2,
  IconExternalLink,
  IconCalendar,
  IconTrendingUp,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  formatPrice,
  calculateUsagePercentage,
} from "@/lib/subscription-config";
import { Database } from "../../database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionPackageRaw =
  Database["public"]["Tables"]["subscription_packages"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionPackage extends Omit<SubscriptionPackageRaw, "features"> {
  features: string[];
}

interface SubscriptionStatusProps {
  profile: Profile;
  subscription: Subscription | null;
  currentPackage: SubscriptionPackage;
  usedDynamicQRs: number;
}

// FIXED: Enhanced status badge with better error handling
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          colour: "bg-green-100 text-green-800 border-green-200",
          icon: <IconCheck size={14} />,
          text: "Active",
        };
      case "past_due":
        return {
          colour: "bg-orange-100 text-orange-800 border-orange-200",
          icon: <IconAlertTriangle size={14} />,
          text: "Past Due",
        };
      case "canceled":
      case "cancelled":
        return {
          colour: "bg-red-100 text-red-800 border-red-200",
          icon: null,
          text: "Canceled",
        };
      case "trialing":
      case "trial":
        return {
          colour: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <IconCalendar size={14} />,
          text: "Trial",
        };
      case "paused":
        return {
          colour: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <IconAlertTriangle size={14} />,
          text: "Paused",
        };
      default:
        return {
          colour: "bg-neutral-100 text-neutral-800 border-neutral-200",
          icon: null,
          text: status || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.colour}`}
    >
      {config.icon}
      {config.text}
    </span>
  );
};

export default function SubscriptionStatus({
  profile,
  subscription,
  currentPackage,
  usedDynamicQRs,
}: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(false);

  // FIXED: Better quota calculation with fallbacks
  const quotaInfo = useMemo(() => {
    const subscriptionQuota =
      profile?.dynamic_qr_quota || currentPackage?.quota_amount || 0;
    const totalQuota = Math.max(subscriptionQuota, 0);
    const usagePercentage = calculateUsagePercentage(
      Math.max(usedDynamicQRs || 0, 0),
      totalQuota,
    );

    return {
      subscriptionQuota,
      totalQuota,
      usagePercentage,
      remaining: Math.max(0, totalQuota - (usedDynamicQRs || 0)),
    };
  }, [profile, currentPackage, usedDynamicQRs]);

  // FIXED: Enhanced date formatting with error handling
  const formatDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return "Not available";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  }, []);

  // FIXED: Enhanced subscription management with better validation
  const handleManageSubscription = useCallback(async () => {
    // FIXED: Better validation
    if (!subscription?.paddle_subscription_id) {
      toast("No active subscription", {
        description: "You need an active subscription to manage billing.",
        style: {
          backgroundColor: "rgb(254, 242, 242)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    // FIXED: Don't allow management of canceled subscriptions
    if (
      subscription.status === "canceled" ||
      subscription.status === "cancelled"
    ) {
      toast("Subscription canceled", {
        description:
          "This subscription has been canceled and cannot be managed.",
        style: {
          backgroundColor: "rgb(254, 242, 242)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/paddle/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      if (!data.url) {
        throw new Error("No portal URL returned from server");
      }

      // FIXED: Add small delay to prevent double-clicks
      setTimeout(() => {
        window.location.href = data.url;
      }, 100);
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast("Error accessing subscription management", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  // FIXED: Enhanced billing info with edge cases
  const billingInfo = useMemo(() => {
    if (!subscription?.current_period_end) return null;

    try {
      const endDate = new Date(subscription.current_period_end);
      if (isNaN(endDate.getTime())) return null;

      const now = new Date();
      const daysUntilRenewal = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        date: formatDate(subscription.current_period_end),
        daysUntil: daysUntilRenewal,
        isExpiringSoon: daysUntilRenewal <= 7 && daysUntilRenewal > 0,
        isOverdue: daysUntilRenewal < 0,
      };
    } catch (error) {
      console.error("Error calculating billing info:", error);
      return null;
    }
  }, [subscription, formatDate]);

  // FIXED: More nuanced usage bar color
  const getUsageBarColour = useCallback((percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 90) return "bg-orange-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-qrmory-purple-800";
  }, []);

  // FIXED: Don't render if essential data is missing
  if (!currentPackage) {
    return (
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <div className="text-center text-neutral-600">
          <IconAlertTriangle size={24} className="mx-auto mb-2" />
          <p>Unable to load subscription information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* Header with improved error states */}
      <div className="bg-gradient-to-r from-qrmory-purple-800 to-qrmory-purple-600 text-white p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold">{currentPackage.name} Plan</h2>
              {subscription && <StatusBadge status={subscription.status} />}
            </div>

            {subscription && billingInfo && (
              <p className="text-qrmory-purple-100">
                {subscription.status === "active" ? (
                  billingInfo.isOverdue ? (
                    <>
                      <IconAlertTriangle size={16} className="inline mr-1" />
                      Overdue by {Math.abs(billingInfo.daysUntil)} days
                    </>
                  ) : billingInfo.isExpiringSoon ? (
                    <>
                      <IconCalendar size={16} className="inline mr-1" />
                      Renews in {billingInfo.daysUntil} days ({billingInfo.date}
                      )
                    </>
                  ) : (
                    `Next billing: ${billingInfo.date}`
                  )
                ) : (
                  `Status: ${subscription.status}`
                )}
              </p>
            )}

            {!subscription && profile?.subscription_status && (
              <p className="text-qrmory-purple-200 text-sm">
                Account status: {profile.subscription_status}
              </p>
            )}

            {currentPackage.description && (
              <p className="text-qrmory-purple-200 text-sm mt-1">
                {currentPackage.description}
              </p>
            )}
          </div>

          {subscription && subscription.status === "active" && (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="mt-4 md:mt-0 py-2 px-4 rounded-md transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Manage subscription in Paddle portal"
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
      </div>

      {/* Rest of component remains the same... */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <IconTrendingUp size={20} />
              Dynamic QR Codes Usage
            </h3>
            <span className="text-sm text-neutral-600 font-medium">
              {usedDynamicQRs || 0} / {quotaInfo.totalQuota}
            </span>
          </div>

          {/* Usage Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getUsageBarColour(
                quotaInfo.usagePercentage,
              )}`}
              style={{ width: `${Math.min(100, quotaInfo.usagePercentage)}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-neutral-600">
            <span>{quotaInfo.usagePercentage}% used</span>
            <span>{quotaInfo.remaining} remaining</span>
          </div>

          {/* FIXED: Better usage warning logic */}
          {quotaInfo.usagePercentage >= 75 && (
            <div
              className={`mt-3 p-3 rounded-lg border ${
                quotaInfo.usagePercentage >= 100
                  ? "bg-red-50 border-red-200 text-red-800"
                  : quotaInfo.usagePercentage >= 90
                    ? "bg-orange-50 border-orange-200 text-orange-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <IconAlertTriangle size={16} />
                <span className="font-medium">
                  {quotaInfo.usagePercentage >= 100
                    ? "Quota exceeded!"
                    : quotaInfo.usagePercentage >= 90
                      ? "Almost at your limit"
                      : "Running low on QR codes"}
                </span>
              </div>
              <p className="text-sm mt-1">
                {quotaInfo.usagePercentage >= 100
                  ? "You can't create more dynamic QR codes. Please upgrade your plan."
                  : "Consider upgrading your plan to avoid interruption."}
              </p>
            </div>
          )}
        </div>

        {/* Plan Features */}
        {currentPackage.features && currentPackage.features.length > 0 && (
          <div className="bg-neutral-50 rounded-lg p-4">
            <h4 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
              <IconCheck size={18} />
              Your {currentPackage.name} Plan Includes:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPackage.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-neutral-600"
                >
                  <div className="w-2 h-2 bg-qrmory-purple-800 rounded-full mt-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FIXED: Pricing info with better formatting */}
        {currentPackage.price_in_cents !== undefined &&
          currentPackage.price_in_cents > 0 &&
          currentPackage.quota_amount > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Monthly cost:</span>
                <span className="font-semibold text-neutral-800">
                  {formatPrice(currentPackage.price_in_cents)}/month
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-neutral-600">Cost per QR code:</span>
                <span className="font-semibold text-neutral-800">
                  {formatPrice(
                    Math.round(
                      currentPackage.price_in_cents /
                        currentPackage.quota_amount,
                    ),
                  )}
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
