"use client";

import { useState, useCallback, useMemo } from "react";
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
type QuotaPackage = Database["public"]["Tables"]["quota_packages"]["Row"];

interface SubscriptionPackage extends Omit<SubscriptionPackageRaw, "features"> {
  features: string[];
}

interface SubscriptionPlansProps {
  currentLevel: number;
  packages: SubscriptionPackage[];
  boosters?: QuotaPackage[];
  subscription: Subscription | null;
  usedQuota?: number;
  totalQuota?: number;
}

type LoadingState = {
  type: "subscription" | "booster" | null;
  id: string | number | null;
};

export default function SubscriptionPlans({
  currentLevel,
  packages,
  boosters = [], // Provide default empty array
  subscription,
  usedQuota = 0,
  totalQuota = 0,
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<LoadingState>({
    type: null,
    id: null,
  });

  // Memoized sorted packages
  const sortedPackages = useMemo(
    () =>
      packages.filter((pkg) => pkg.is_active).sort((a, b) => a.level - b.level),
    [packages],
  );

  // Memoized active boosters - handle undefined boosters
  const activeBoosters = useMemo(
    () => (boosters ? boosters.filter((booster) => booster.is_active) : []),
    [boosters],
  );

  // Handle subscription upgrade/downgrade
  const handleSubscriptionChange = useCallback(
    async (level: number) => {
      if (loading.type !== null) return;

      try {
        setLoading({ type: "subscription", id: level });

        const response = await fetch("/api/paddle/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: level.toString(),
            success_url: `${window.location.origin}/subscription?success=true`,
            cancel_url: `${window.location.origin}/subscription?canceled=true`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        const data = await response.json();

        window.location.href = data.url;
      } catch (error) {
        console.error("Error creating checkout:", error);
        toast("Failed to start checkout", {
          description:
            error instanceof Error ? error.message : "Please try again later.",
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
        });
      } finally {
        setLoading({ type: null, id: null });
      }
    },
    [loading.type],
  );

  // Handle booster purchase
  const handleBoosterPurchase = useCallback(
    async (boosterId: string) => {
      if (loading.type !== null) return;

      try {
        setLoading({ type: "booster", id: boosterId });

        // Use subscription checkout since boosters are monthly subscriptions
        const response = await fetch("/api/paddle/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            package_id: boosterId, // Pass package_id instead of level
            type: "booster", // Indicate this is a booster subscription
            success_url: `${window.location.origin}/subscription?booster_success=true`,
            cancel_url: `${window.location.origin}/subscription?canceled=true`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        const data = await response.json();

        window.location.href = data.url;
      } catch (error) {
        console.error("Error creating booster checkout:", error);
        toast("Failed to start booster subscription", {
          description:
            error instanceof Error ? error.message : "Please try again later.",
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
        });
      } finally {
        setLoading({ type: null, id: null });
      }
    },
    [loading.type],
  );

  // Helper functions for button states
  const getSubscriptionButtonText = useCallback(
    (pkg: SubscriptionPackage) => {
      if (pkg.level === currentLevel) return "Current Plan";
      if (pkg.level < currentLevel) return "Downgrade";
      return "Upgrade";
    },
    [currentLevel],
  );

  const isSubscriptionButtonDisabled = useCallback(
    (pkg: SubscriptionPackage) => {
      return pkg.level === currentLevel || loading.type !== null;
    },
    [currentLevel, loading.type],
  );

  const getSubscriptionButtonStyle = useCallback(
    (pkg: SubscriptionPackage) => {
      const isLoading =
        loading.type === "subscription" && loading.id === pkg.level;
      const isCurrent = pkg.level === currentLevel;
      const isDisabled = isSubscriptionButtonDisabled(pkg);

      if (isCurrent) {
        return "bg-neutral-200 text-neutral-600 cursor-not-allowed";
      }
      if (isDisabled) {
        return "bg-neutral-300 text-neutral-500 cursor-not-allowed";
      }
      if (pkg.level > currentLevel) {
        return "bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700 disabled:opacity-50";
      }
      return "bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50";
    },
    [currentLevel, loading, isSubscriptionButtonDisabled],
  );

  // Usage warning thresholds
  const usagePercentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  // Only show usage warning if we have quota data
  const showUsageWarning = totalQuota > 0 && isNearLimit;

  return (
    <div className="space-y-8">
      {/* Usage Warning - only show if we have usage data */}
      {showUsageWarning && (
        <div
          className={`p-4 rounded-lg border ${
            isAtLimit
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <IconBolt size={20} />
            <p className="font-medium">
              {isAtLimit
                ? "You've reached your QR code limit!"
                : "You're running low on QR codes"}
            </p>
          </div>
          <p className="text-sm mt-1">
            {isAtLimit
              ? "Upgrade your plan or purchase a booster to create more dynamic QR codes."
              : `You've used ${usedQuota} of ${totalQuota} dynamic QR codes. Consider upgrading soon.`}
          </p>
        </div>
      )}

      {/* Subscription Plans */}
      <div>
        <h3 className="text-xl font-bold text-qrmory-purple-800 mb-4">
          Subscription Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border rounded-lg p-6 shadow-sm relative ${
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
                <h4 className="text-lg font-semibold mb-2">{pkg.name}</h4>
                <p className="text-sm text-neutral-600 mb-4 h-10">
                  {pkg.description}
                </p>

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
                    {pkg.quota_amount} Dynamic QR codes
                  </span>
                  <span className="text-sm text-neutral-500 block">
                    per month
                  </span>
                </div>

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

                <button
                  onClick={() => handleSubscriptionChange(pkg.level)}
                  disabled={isSubscriptionButtonDisabled(pkg)}
                  className={`w-full py-3 px-4 rounded-md flex items-center justify-center font-medium transition-all duration-200 ${getSubscriptionButtonStyle(
                    pkg,
                  )}`}
                  aria-label={`${getSubscriptionButtonText(pkg)} to ${
                    pkg.name
                  }`}
                >
                  {loading.type === "subscription" &&
                  loading.id === pkg.level ? (
                    <>
                      <IconLoader2 size={18} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    getSubscriptionButtonText(pkg)
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booster Packages - only show if boosters are provided */}
      {boosters && boosters.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconBolt className="text-orange-600" size={24} />
            <h3 className="text-xl font-bold text-qrmory-purple-800">
              Booster Subscriptions
            </h3>
          </div>
          <p className="text-neutral-600 mb-6">
            Need extra QR codes? Add monthly booster subscriptions to increase
            your quota.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeBoosters.map((booster) => (
              <div
                key={booster.id}
                className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2 text-orange-700">
                    {booster.name}
                  </h4>
                  <p className="text-sm text-neutral-600 mb-4 h-10">
                    {booster.description ||
                      `Get ${booster.quantity} extra QR codes`}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-orange-600">
                      {formatPrice(booster.price_in_cents)}
                    </span>
                    <span className="text-sm text-neutral-600 ml-1">
                      /month
                    </span>
                  </div>

                  <div className="mb-6">
                    <span className="text-lg font-semibold text-neutral-800">
                      +{booster.quantity} QR codes
                    </span>
                    <span className="text-sm text-neutral-500 block">
                      added to your monthly quota
                    </span>
                  </div>

                  <button
                    onClick={() => handleBoosterPurchase(booster.id)}
                    disabled={loading.type !== null}
                    className={`w-full py-3 px-4 rounded-md flex items-center justify-center font-medium transition-all duration-200 ${
                      loading.type === "booster" && loading.id === booster.id
                        ? "bg-orange-400 text-white cursor-not-allowed"
                        : loading.type !== null
                          ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                          : "bg-orange-600 text-white hover:bg-orange-700"
                    }`}
                    aria-label={`Purchase ${booster.name} booster`}
                  >
                    {loading.type === "booster" && loading.id === booster.id ? (
                      <>
                        <IconLoader2 size={18} className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <IconBolt size={18} className="mr-2" />
                        Subscribe
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeBoosters.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <IconBolt size={48} className="mx-auto mb-4 opacity-50" />
              <p>No booster subscriptions available at this time.</p>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <h4 className="font-medium text-neutral-800 mb-2">
          How does billing work?
        </h4>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>
            • Subscription plans are billed monthly and include a set number of
            dynamic QR codes
          </li>
          <li>
            • Booster subscriptions are additional monthly add-ons that increase
            your quota
          </li>
          <li>
            • You can upgrade, downgrade, or cancel subscriptions at any time
          </li>
          <li>
            • All subscriptions include ongoing support, maintenance, and secure
            storage
          </li>
        </ul>
      </div>
    </div>
  );
}
