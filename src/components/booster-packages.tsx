// components/booster-packages.tsx
"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/subscription-config";
import { IconLoader2 } from "@tabler/icons-react";

export interface QuotaPackage {
  id: string;
  name: string;
  quantity: number;
  price_in_cents: number;
  is_active: boolean;
  description?: string;
  stripe_price_id: string;
}

interface BoosterPackagesProps {
  packages: QuotaPackage[];
}

export default function BoosterPackages({ packages }: BoosterPackagesProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    try {
      setLoading(packageId);

      const response = await fetch("/api/create-quota-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          package_id: packageId,
          success_url: `${window.location.origin}/subscription?booster_success=true`,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <div key={pkg.id} className="border rounded-lg p-6 shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
          <p className="text-sm text-neutral-600 mb-4">{pkg.description}</p>

          <div className="mb-4">
            <span className="text-2xl font-bold text-qrmory-purple-800">
              {formatPrice(pkg.price_in_cents)}
            </span>
            <span className="text-sm text-neutral-600 ml-2">one-time</span>
          </div>

          <div className="mb-4">
            <span className="text-lg font-semibold text-neutral-800">
              +{pkg.quantity} QR codes
            </span>
          </div>

          <button
            onClick={() => handlePurchase(pkg.id)}
            disabled={loading === pkg.id}
            className="w-full py-2 px-4 bg-qrmory-purple-800 text-white rounded-md hover:bg-qrmory-purple-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading === pkg.id ? (
              <>
                <IconLoader2 size={18} className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Purchase Booster"
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
