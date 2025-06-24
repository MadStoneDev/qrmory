"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

import { toast } from "sonner";
import { IconLoader2, IconQrcode } from "@tabler/icons-react";

type BoosterPackagesProps = {
  packages: any[];
};

export default function BoosterPackages({ packages }: BoosterPackagesProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    try {
      setLoading(packageId);
      const supabase = createClient();

      // Create a checkout session for the booster package
      const response = await fetch("/api/create-quota-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          package_id: packageId,
          success_url:
            window.location.origin + "/subscription?booster_success=true",
          cancel_url: window.location.origin + "/subscription?canceled=true",
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create checkout session");

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast("Error purchasing booster package", {
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

  if (packages.length === 0) {
    return (
      <div className="text-center p-6 bg-neutral-50 rounded-lg">
        <p>No booster packages are currently available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className="border rounded-lg overflow-hidden shadow-sm border-neutral-200"
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-qrmory-purple-800">
              {pkg.name}
            </h3>
            <p className="text-2xl font-bold mt-2">
              ${(pkg.price_in_cents / 100).toFixed(2)}
              <span className="text-neutral-500 text-sm font-normal">
                /one-time
              </span>
            </p>
            <div className="mt-4">
              <div className="flex items-center">
                <IconQrcode size={24} className="text-qrmory-purple-800 mr-2" />
                <p className="font-medium text-neutral-700">
                  {pkg.quantity} Additional Dynamic QR Codes
                </p>
              </div>
              <p className="mt-4 text-sm text-neutral-600">
                {pkg.description ||
                  "Boost your dynamic QR code quota with this one-time purchase. These codes will be added to your current quota."}
              </p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <button
              onClick={() => handlePurchase(pkg.id)}
              disabled={loading !== null}
              className="w-full py-2 px-4 rounded-md transition-colors bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700 flex items-center justify-center"
            >
              {loading === pkg.id ? (
                <>
                  <IconLoader2 size={18} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Purchase Booster`
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
