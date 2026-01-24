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

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionPackageRaw =
  Database["public"]["Tables"]["subscription_packages"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionPackage extends Omit<SubscriptionPackageRaw, "features"> {
  features: string[];
}

interface SubscriptionPlansProps {
  profile: Profile | null;
  currentLevel: number | null;
  packages: SubscriptionPackage[] | null;
  subscription: Subscription | null;
  usedQuota: number;
  totalQuota: number;
}

export default function SubscriptionPlans({
  profile,
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
    if (currentLevel === null || profile === null) return "Get a Free Account";

    if (pkg.level === currentLevel) return "Current Plan";
    if (pkg.level < currentLevel) return "Downgrade";
    return "Upgrade";
  };

  const getButtonStyle = (pkg: SubscriptionPackage) => {
    if (currentLevel === null || profile === null) {
      return "bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700";
    }

    if (pkg.level === currentLevel) {
      return "bg-neutral-200 text-neutral-600 cursor-not-allowed";
    }

    if (loading !== null) {
      return "bg-neutral-300 text-neutral-500 cursor-not-allowed";
    }

    if (currentLevel === null || pkg.level > currentLevel) {
      return "bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700";
    }
    return "bg-orange-600 text-white hover:bg-orange-700";
  };

  // Simple usage warning
  const usagePercent =
    totalQuota > 0 ? Math.round((usedQuota / totalQuota) * 100) : 0;
  const showWarning = usagePercent >= 90;

  return (
    <div className="h-full space-y-6">
      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages &&
          packages
            .filter((pkg) => pkg.is_active)
            .sort((a, b) => a.level - b.level)
            .map((pkg) => (
              <div
                key={pkg.id}
                className={`border rounded-lg p-6 relative ${
                  pkg.level === currentLevel && profile !== null
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

                <div className="flex flex-col h-full text-center">
                  <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>

                  {pkg.description && (
                    <p className="text-sm text-neutral-600 mb-4 h-10">
                      {pkg.description}
                    </p>
                  )}

                  <div className="mb-2">
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
                  </div>

                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="flex-grow mb-6 space-y-2 text-left">
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

                  {profile === null ? (
                    <a
                      href="/login"
                      className={`w-full py-3 px-4 rounded-md flex items-center justify-center font-medium transition-all duration-200 ${getButtonStyle(
                        pkg,
                      )}`}
                    >
                      {getButtonText(pkg)}
                    </a>
                  ) : (
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
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Simple help text */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <h4 className="font-medium text-neutral-800 mb-2">How billing works</h4>
        <p className="text-sm text-neutral-600">
          Plans are billed monthly and support, analytics and access for the
          specified number of dynamic QR codes.
        </p>
      </div>

      {/* CTA for non-logged-in users */}
      {profile === null && (
        <div className="bg-qrmory-purple-800 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">
            Ready to get started?
          </h3>
          <p className="text-qrmory-purple-200 mb-6 max-w-xl mx-auto">
            Create your free account today and start generating dynamic QR codes.
            No credit card required. Upgrade anytime.
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-white text-qrmory-purple-800 rounded-lg font-semibold hover:bg-qrmory-purple-50 transition-colors duration-300"
          >
            Create a Free Account
          </a>
        </div>
      )}
    </div>
  );
}
