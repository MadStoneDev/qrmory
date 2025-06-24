"use client";

import { useState } from "react";
import { SUBSCRIPTION_LEVELS, QuotaInfo } from "@/lib/subscription-config";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";

type SubscriptionPlansProps = {
  currentLevel: number;
  quotas: QuotaInfo[];
  subscription: any | null;
};

export default function SubscriptionPlans({
  currentLevel,
  quotas,
  subscription,
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const handleSubscribe = async (level: number) => {
    if (level <= currentLevel) return;

    try {
      setLoading(level);
      const supabase = await createClient();

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
            level: level.toString(),
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

  // Filter out the free plan and current or lower plans
  const upgradePlans = quotas.filter((quota, index) => index > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {upgradePlans.map((plan, index) => {
        const level = index + 1; // Since free plan (index 0) is filtered out
        const isCurrentPlan = level === currentLevel;

        return (
          <div
            key={plan.subscription}
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
                {plan.subscription}
              </h3>
              {plan.price !== undefined && (
                <p className="text-2xl font-bold mt-2">
                  ${(plan.price / 100).toFixed(2)}
                  <span className="text-neutral-500 text-sm font-normal">
                    /month
                  </span>
                </p>
              )}
              <div className="mt-4">
                <p className="font-medium text-neutral-700">
                  {plan.dynamicCodes} Dynamic QR Codes
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features?.map((feature, i) => (
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
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => handleSubscribe(level)}
                disabled={isCurrentPlan || loading !== null}
                className={`
                  w-full py-2 px-4 rounded-md transition-colors flex items-center justify-center
                  ${
                    isCurrentPlan
                      ? "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                      : "bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700"
                  }
                `}
              >
                {loading === level ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : (
                  `Upgrade to ${plan.subscription}`
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
