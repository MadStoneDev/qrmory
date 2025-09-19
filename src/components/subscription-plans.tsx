// Simplified subscription-plans.tsx - removes ALL booster complexity
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/subscription-config";
import {
  IconCheck,
  IconLoader2,
  IconStar,
  IconBolt,
} from "@tabler/icons-react";
import { Database } from "../../database.types";

type SubscriptionPackageRaw =
  Database["public"]["Tables"]["subscription_packages"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionPackage extends Omit<SubscriptionPackageRaw, "features"> {
  features: string[];
}

interface SubscriptionPlansProps {
  currentLevel: number;
  packages: SubscriptionPackage[];
  subscription: Subscription | null;
  usedQuota: number;
  totalQuota: number;
}

export default function SubscriptionPlans({
  currentLevel,
  packages,
  usedQuota = 0,
  totalQuota = 0,
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const handleSubscriptionChange = async (level: number) => {
    if (level === currentLevel || loading !== null) return;

    setLoading(level);

    try {
      const response = await fetch("/api/paddle/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast("Failed to start checkout", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (pkg: SubscriptionPackage) => {
    if (pkg.level === currentLevel) return "Current Plan";
    if (pkg.level < currentLevel) return "Downgrade";
    return "Upgrade";
  };

  const getButtonStyle = (pkg: SubscriptionPackage) => {
    if (pkg.level === currentLevel) {
      return "bg-neutral-200 text-neutral-600 cursor-not-allowed";
    }
    if (loading !== null) {
      return "bg-neutral-300 text-neutral-500 cursor-not-allowed";
    }
    if (pkg.level > currentLevel) {
      return "bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700";
    }
    return "bg-orange-600 text-white hover:bg-orange-700";
  };

  // Simple usage warning
  const usagePercent =
    totalQuota > 0 ? Math.round((usedQuota / totalQuota) * 100) : 0;
  const showWarning = usagePercent >= 90;

  return (
    <div className="space-y-6">
      {/* Simple usage warning */}
      {showWarning && (
        <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2">
            <IconBolt className="text-amber-600" size={20} />
            <p className="font-medium text-amber-800">
              {usagePercent >= 100
                ? "You've reached your limit!"
                : "Running low on QR codes"}
            </p>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            {usagePercent >= 100
              ? "Upgrade your plan to create more dynamic QR codes."
              : `You've used ${usedQuota} of ${totalQuota} QR codes. Consider upgrading.`}
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages
          .filter((pkg) => pkg.is_active)
          .sort((a, b) => a.level - b.level)
          .map((pkg) => (
            <div
              key={pkg.id}
              className={`border rounded-lg p-6 relative ${
                pkg.level === currentLevel
                  ? "ring-2 ring-qrmory-purple-800 bg-qrmory-purple-50"
                  : "bg-white hover:shadow-md transition-shadow"
              }`}
            >
              {/* Popular badge for level 2 */}
              {pkg.level === 2 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-qrmory-purple-800 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <IconStar size={12} />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>

                {pkg.description && (
                  <p className="text-sm text-neutral-600 mb-4 h-10">
                    {pkg.description}
                  </p>
                )}

                <div className="mb-4">
                  <span className="text-3xl font-bold text-qrmory-purple-800">
                    {pkg.price_in_cents === 0
                      ? "Free"
                      : formatPrice(pkg.price_in_cents)}
                  </span>
                  {pkg.price_in_cents > 0 && (
                    <span className="text-sm text-neutral-600 ml-1">
                      /month
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-lg font-semibold text-neutral-800">
                    {pkg.quota_amount} QR codes
                  </span>
                  <span className="text-sm text-neutral-500 block">
                    per month
                  </span>
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="mb-6 space-y-2 text-left">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <IconCheck
                          size={16}
                          className="text-green-600 mr-2 flex-shrink-0 mt-0.5"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => handleSubscriptionChange(pkg.level)}
                  disabled={pkg.level === currentLevel || loading !== null}
                  className={`w-full py-3 px-4 rounded-md flex items-center justify-center font-medium transition-all duration-200 ${getButtonStyle(
                    pkg,
                  )}`}
                >
                  {loading === pkg.level ? (
                    <>
                      <IconLoader2 size={18} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    getButtonText(pkg)
                  )}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Simple help text */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <h4 className="font-medium text-neutral-800 mb-2">How billing works</h4>
        <p className="text-sm text-neutral-600">
          Plans are billed monthly and include the specified number of dynamic
          QR codes. You can upgrade, downgrade, or cancel anytime. All plans
          include support and secure storage.
        </p>
      </div>
    </div>
  );
}
