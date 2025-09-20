// app/dashboard/checkout/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { initializePaddle, type Environments } from "@paddle/paddle-js";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const transactionId = searchParams.get("_ptxn");

  useEffect(() => {
    console.log("Checkout page loaded with transaction:", transactionId);

    // Check required environment variables
    if (
      !process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ||
      !process.env.NEXT_PUBLIC_PADDLE_ENV
    ) {
      setError("Paddle checkout not configured. Please contact support.");
      setLoading(false);
      return;
    }

    // Check for transaction ID
    if (!transactionId) {
      setError(
        "No transaction ID found. Please try again from the subscription page.",
      );
      setLoading(false);
      return;
    }

    // Initialize Paddle and open checkout
    initializePaddle({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
      checkout: {
        settings: {
          displayMode: "overlay",
          successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
          theme: "light",
        },
      },
    })
      .then((paddle) => {
        if (paddle) {
          console.log("Opening Paddle checkout overlay");

          paddle.Checkout.open({
            transactionId: transactionId,
          });

          setLoading(false);
        } else {
          setError("Failed to initialize Paddle checkout.");
          setLoading(false);
        }
      })
      .catch((paddleError) => {
        console.error("Paddle initialization error:", paddleError);
        setError(`Checkout initialization failed: ${paddleError.message}`);
        setLoading(false);
      });
  }, [transactionId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-red-800 mb-2">
              Checkout Error
            </h1>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => (window.location.href = "/dashboard/subscription")}
              className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Return to Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qrmory-purple-800 mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold mb-2">
              Preparing Your Checkout
            </h1>
            <p className="text-gray-600">
              Please wait while we load the payment form...
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-2">Checkout Ready</h1>
            <p className="text-gray-600">
              The payment overlay should appear shortly.
            </p>
          </>
        )}

        {transactionId && (
          <p className="text-sm text-gray-500 mt-4">
            Transaction: {transactionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}
