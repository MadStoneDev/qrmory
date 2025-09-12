"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/subscription-config";
import { IconLoader2, IconBolt, IconPlus } from "@tabler/icons-react";
import { Database } from "../../database.types";

type QuotaPackage = Database["public"]["Tables"]["quota_packages"]["Row"];

interface BoosterPackagesProps {
  packages: QuotaPackage[];
}

export default function BoosterPackages({ packages }: BoosterPackagesProps) {
  const [loading, setLoading] = useState<string | null>(null);

  // Filter active packages and sort by price
  const activePackages = useMemo(
    () =>
      packages
        .filter((pkg) => pkg.is_active)
        .sort((a, b) => a.price_in_cents - b.price_in_cents),
    [packages],
  );

  // Handle booster purchase
  const handleBoosterPurchase = useCallback(
    async (packageId: string, packageName: string) => {
      if (loading) return;

      try {
        setLoading(packageId);

        // Use the subscription checkout endpoint since boosters are monthly subscriptions
        const response = await fetch("/api/paddle/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            package_id: packageId, // Pass package_id instead of level
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

        if (!data.url) {
          throw new Error("No checkout URL returned from server");
        }

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
        setLoading(null);
      }
    },
    [loading],
  );

  // Calculate value per QR code
  const calculateValuePerQR = useCallback(
    (priceInCents: number, quantity: number) => {
      return formatPrice(Math.round(priceInCents / quantity));
    },
    [],
  );

  if (activePackages.length === 0) {
    return (
      <div className="text-center py-12 bg-neutral-50 rounded-lg">
        <IconBolt size={48} className="mx-auto mb-4 text-neutral-400" />
        <h3 className="text-lg font-medium text-neutral-600 mb-2">
          No Booster Subscriptions Available
        </h3>
        <p className="text-neutral-500">
          Booster subscriptions are currently unavailable. Please check back
          later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <IconBolt className="text-orange-600" size={28} />
        <div>
          <h2 className="text-xl font-bold text-qrmory-purple-800">
            Booster Subscriptions
          </h2>
          <p className="text-neutral-600 text-sm">
            Monthly add-ons to boost your QR code quota
          </p>
        </div>
      </div>

      {/* Booster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activePackages.map((pkg, index) => (
          <div
            key={pkg.id}
            className={`relative border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-all duration-200 ${
              index === 1
                ? "border-orange-300 bg-orange-50"
                : "border-neutral-200"
            }`}
          >
            {/* Popular badge for middle package */}
            {index === 1 && activePackages.length >= 3 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Best Value
                </div>
              </div>
            )}

            <div className="text-center">
              {/* Package Name */}
              <h3 className="text-lg font-semibold mb-2 text-orange-700">
                {pkg.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-neutral-600 mb-4 min-h-[2.5rem] flex items-center justify-center">
                {pkg.description ||
                  `Add ${pkg.quantity} dynamic QR codes to your monthly quota`}
              </p>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-orange-600">
                  {formatPrice(pkg.price_in_cents)}
                </span>
                <span className="text-sm text-neutral-600 ml-1">/month</span>
              </div>

              {/* Quantity */}
              <div className="mb-4 p-3 bg-orange-100 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <IconPlus size={18} className="text-orange-600" />
                  <span className="text-xl font-bold text-orange-800">
                    {pkg.quantity}
                  </span>
                  <span className="text-orange-700">QR codes</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Added to your monthly quota
                </p>
              </div>

              {/* Value calculation */}
              <div className="mb-6 text-xs text-neutral-500">
                {calculateValuePerQR(pkg.price_in_cents, pkg.quantity)} per QR
                code
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handleBoosterPurchase(pkg.id, pkg.name)}
                disabled={loading !== null}
                className={`w-full py-3 px-4 rounded-md flex items-center justify-center font-medium transition-all duration-200 ${
                  loading === pkg.id
                    ? "bg-orange-400 text-white cursor-not-allowed"
                    : loading !== null
                      ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                      : index === 1
                        ? "bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg"
                        : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
                aria-label={`Subscribe to ${pkg.name} for ${formatPrice(
                  pkg.price_in_cents,
                )} per month`}
              >
                {loading === pkg.id ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IconBolt size={18} className="mr-2" />
                    Subscribe Now
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Information Section */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-8">
        <div className="flex items-start gap-3">
          <IconBolt
            className="text-orange-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <h4 className="font-medium text-orange-800 mb-2">
              How Booster Subscriptions Work
            </h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>
                • Boosters are monthly subscriptions that add extra QR codes to
                your quota
              </li>
              <li>
                • You can have multiple booster subscriptions running
                simultaneously
              </li>
              <li>
                • Includes ongoing support, maintenance, and secure cloud
                storage
              </li>
              <li>• Can be canceled anytime - no long-term commitments</li>
              <li>
                • Perfect for growing businesses with increasing QR code needs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
