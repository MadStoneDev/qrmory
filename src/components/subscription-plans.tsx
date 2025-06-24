"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";

// Updated interface to match your database structure
interface SubscriptionPackage {
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

// Updated props to match what you're passing from the subscription page
type SubscriptionPlansProps = {
  currentLevel: number;
  packages: SubscriptionPackage[]; // Changed from 'quotas' to 'packages'
  subscription: any | null;
};

export default function SubscriptionPlans({
  currentLevel,
  packages, // Updated prop name
  subscription,
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const handleSubscribe = async (packageLevel: number) => {
    if (packageLevel <= currentLevel) return;

    try {
      setLoading(packageLevel);

      // Check if user is already subscribed
      if (subscription && subscription.status === "active") {
        // If already subscribed, create a portal session to manage subscription
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
      } else {
        // Create a new checkout session
        const response = await fetch("/api/create-stripe-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: packageLevel.toString(),
            success_url: window.location.origin + "/subscription?success=true",
            cancel_url: window.location.origin + "/subscription?canceled=true",
          }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to create checkout session");

        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating stripe session:", error);
      toast("Error creating subscription", {
        description: "Something went wrong. Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setLoading(null);
    }
  };

  // Filter out the free plan and only show paid upgrade options
  const upgradePlans = packages
    .filter((pkg) => pkg.level > 0 && pkg.stripe_price_id) // Only paid plans with Stripe price IDs
    .sort((a, b) => a.level - b.level); // Sort by level

  if (upgradePlans.length === 0) {
    return (
      <div className="text-center p-6 bg-neutral-50 rounded-lg">
        <p className="text-neutral-600">
          No upgrade plans are currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {upgradePlans.map((plan) => {
        const isCurrentPlan = plan.level === currentLevel;
        const isLowerPlan = plan.level < currentLevel;

        return (
          <div
            key={plan.id}
            className={`
              border rounded-lg overflow-hidden shadow-sm 
              ${
                isCurrentPlan
                  ? "border-qrmory-purple-800 ring-2 ring-qrmory-purple-300"
                  : "border-neutral-200"
              }
            `}
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-qrmory-purple-800">
                {plan.name}
              </h3>

              {/* Price display */}
              <p className="text-2xl font-bold mt-2">
                ${(plan.price_in_cents / 100).toFixed(2)}
                <span className="text-neutral-500 text-sm font-normal">
                  /month
                </span>
              </p>

              {/* Plan description */}
              {plan.description && (
                <p className="text-sm text-neutral-600 mt-2">
                  {plan.description}
                </p>
              )}

              <div className="mt-4">
                <p className="font-medium text-neutral-700">
                  {plan.quota_amount} Dynamic QR Codes
                </p>

                {/* Features list */}
                {plan.features && plan.features.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <IconCheck
                          size={18}
                          className="text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        />
                        <span className="text-sm text-neutral-600">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => handleSubscribe(plan.level)}
                disabled={isCurrentPlan || isLowerPlan || loading !== null}
                className={`
                  w-full py-2 px-4 rounded-md transition-colors flex items-center justify-center
                  ${
                    isCurrentPlan
                      ? "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                      : isLowerPlan
                        ? "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                        : "bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700"
                  }
                `}
              >
                {loading === plan.level ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : isLowerPlan ? (
                  "Lower Plan"
                ) : subscription && subscription.status === "active" ? (
                  `Change to ${plan.name}`
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
