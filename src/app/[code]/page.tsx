"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function CodeReroute({ params }: { params: { code: string } }) {
  const code = params.code;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        setIsLoading(true);

        // Create Supabase client
        const supabase = createClient();

        // Try multiple query approaches for mobile compatibility
        let data = null;
        let dbError = null;

        // Method 1: Standard single query
        const { data: result1, error: error1 } = await supabase
          .from("qr_codes")
          .select("qr_value, is_active, shortcode")
          .eq("shortcode", code)
          .single();

        if (!error1 && result1) {
          data = result1;
        } else {
          // Method 2: Query without .single() then filter
          const { data: result2, error: error2 } = await supabase
            .from("qr_codes")
            .select("qr_value, is_active, shortcode")
            .eq("shortcode", code);

          if (!error2 && result2 && result2.length > 0) {
            data = result2[0]; // Take first result
          } else {
            // Method 3: Try with explicit limit
            const { data: result3, error: error3 } = await supabase
              .from("qr_codes")
              .select("qr_value, is_active, shortcode")
              .eq("shortcode", code)
              .limit(1);

            if (!error3 && result3 && result3.length > 0) {
              data = result3[0];
            } else {
              dbError =
                error1 || error2 || error3 || new Error("No data found");
            }
          }
        }

        if (dbError && !data) {
          throw dbError;
        }

        // Check if we found a QR code and if it's active
        if (data && data.is_active) {
          // Track the scan via API
          try {
            const trackingPromise = fetch("/api/track-scan", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                shortcode: code,
              }),
              keepalive: true,
            });

            // Don't await, but handle errors
            trackingPromise.catch((e) => console.error("Analytics error:", e));
          } catch (analyticsError) {
            console.error("Analytics error:", analyticsError);
          }

          // Check if the QR value is a URL (starts with http:// or https://)
          const redirectUrl = data.qr_value.startsWith("http")
            ? data.qr_value
            : `/view/${code}`;

          // Use different redirect methods based on device
          const isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent,
            );

          if (isMobile && data.qr_value.startsWith("http")) {
            // For mobile external redirects, use window.location
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 50);
          } else {
            // For desktop or internal routes, use Next.js router
            router.push(redirectUrl);
          }
        } else if (data && !data.is_active) {
          setError("QR code is not active");
          setTimeout(() => router.push("/404"), 2000);
        } else {
          setError("QR code not found");
          setTimeout(() => router.push("/404"), 2000);
        }
      } catch (err) {
        console.error("Error fetching QR code:", err);
        setError("Failed to fetch QR code information");
        setTimeout(() => router.push("/404"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndRedirect();
  }, [code, router]);

  // Show a loading state while fetching
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {isLoading ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <div className="animate-spin h-10 w-10 border-4 border-qrmory-purple-800 rounded-full border-t-transparent mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting to 404...</p>
        </div>
      ) : null}
    </div>
  );
}
