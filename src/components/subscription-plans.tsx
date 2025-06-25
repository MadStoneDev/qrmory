"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/subscription-config";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";

export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  level: number;
  price_in_cents: number;
  quota_amount: number;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  current_period_end: string;
  stripe_subscription_id: string;
}

interface SubscriptionPlansProps {
  currentLevel: number;
  packages: SubscriptionPackage[];
  subscription: Subscription | null;
}

export default function SubscriptionPlans({
  currentLevel,
  packages,
  subscription,
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const handleUpgrade = async (level: number) => {
    try {
      setLoading(level);

      const response = await fetch("/api/create-stripe-checkout", {
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (pkg: SubscriptionPackage) => {
    if (pkg.level === currentLevel) return "Current Plan";
    if (pkg.level < currentLevel) return "Downgrade";
    return "Upgrade";
  };

  const isButtonDisabled = (pkg: SubscriptionPackage) => {
    return pkg.level === currentLevel || pkg.level === 0 || loading !== null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={`border rounded-lg p-6 shadow-sm ${
            pkg.level === currentLevel
              ? "ring-2 ring-qrmory-purple-800 bg-qrmory-purple-50"
              : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
          <p className="text-sm text-neutral-600 mb-4">{pkg.description}</p>

          <div className="mb-4">
            <span className="text-2xl font-bold text-qrmory-purple-800">
              {pkg.price_in_cents === 0
                ? "Free"
                : formatPrice(pkg.price_in_cents)}
            </span>
            {pkg.price_in_cents > 0 && (
              <span className="text-sm text-neutral-600 ml-2">/month</span>
            )}
          </div>

          <div className="mb-4">
            <span className="text-lg font-semibold text-neutral-800">
              {pkg.quota_amount} Dynamic QR codes
            </span>
          </div>

          <ul className="mb-6 space-y-2">
            {pkg.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <IconCheck
                  size={16}
                  className="text-green-600 mr-2 flex-shrink-0"
                />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleUpgrade(pkg.level)}
            disabled={isButtonDisabled(pkg)}
            className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
              pkg.level === currentLevel
                ? "bg-neutral-200 text-neutral-600 cursor-not-allowed"
                : pkg.level === 0
                  ? "bg-neutral-200 text-neutral-600 cursor-not-allowed"
                  : "bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700 disabled:opacity-50"
            }`}
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
      ))}
    </div>
  );
}
