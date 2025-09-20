// dashboard/checkout/[priceId]/page.tsx - MINIMAL VERSION FOR DEFAULT PAYMENT LINK
"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { initializePaddle, type Environments } from "@paddle/paddle-js";

export default function DefaultCheckoutPage() {
  const { priceId } = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only initialize if we have the required environment variables
    if (
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
      process.env.NEXT_PUBLIC_PADDLE_ENV
    ) {
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
        checkout: {
          settings: {
            displayMode: "overlay", // Use overlay for simplicity
            successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
            theme: "light",
          },
        },
      }).then((paddle) => {
        if (paddle && priceId) {
          // Open checkout overlay for the price ID
          paddle.Checkout.open({
            items: [{ priceId: priceId as string, quantity: 1 }],
          });
        } else if (paddle && searchParams.get("_ptxn")) {
          // Handle transaction ID from Paddle payment links
          paddle.Checkout.open({
            transactionId: searchParams.get("_ptxn") as string,
          });
        }
      });
    }
  }, [priceId, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Processing Payment...</h1>
        <p className="text-gray-600">
          Please wait while we redirect you to checkout.
        </p>

        {!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">Checkout not configured properly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
