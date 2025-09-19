// dashboard/pay/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get("_ptxn");

  useEffect(() => {
    // Load Paddle.js
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      // Initialize Paddle
      (window as any).Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN, // You need to add this to your env
        checkout: {
          settings: {
            displayMode: "overlay", // or "inline"
            theme: "light",
            locale: "en",
            successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
            closeUrl: `${window.location.origin}/dashboard/subscription?canceled=true`,
          },
        },
      });

      // If there's a transaction ID, open checkout automatically
      if (transactionId) {
        (window as any).Paddle.Checkout.open({
          transactionId: transactionId,
        });
      } else {
        // No transaction ID, redirect back to subscription page
        router.push("/dashboard/subscription");
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [transactionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Loading Checkout...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we prepare your payment.
          </p>
          {transactionId && (
            <p className="mt-2 text-xs text-gray-500">
              Transaction: {transactionId}
            </p>
          )}
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qrmory-purple-800"></div>
        </div>

        {/* Fallback if JavaScript fails */}
        <noscript>
          <div className="text-center">
            <p className="text-red-600">
              JavaScript is required to process payment.
            </p>
            <a
              href="/dashboard/subscription"
              className="text-qrmory-purple-800 hover:underline"
            >
              Return to subscription page
            </a>
          </div>
        </noscript>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qrmory-purple-800"></div>
        </div>
      }
    >
      <PaymentHandler />
    </Suspense>
  );
}
