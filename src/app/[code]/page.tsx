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

        // Look up the shortcode in the qr_codes table (case sensitive)
        const { data, error: dbError } = await supabase
          .from("qr_codes")
          .select("qr_value, is_active")
          .eq("shortcode", code)
          .single();

        if (dbError) {
          throw dbError;
        }

        // Check if we found a QR code and if it's active
        if (data && data.is_active) {
          // Track the scan via API (don't wait for it)
          fetch("/api/track-scan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shortcode: code,
            }),
            keepalive: true,
          }).catch((e) => console.error("Analytics error:", e));

          // Determine redirect URL
          const redirectUrl = data.qr_value.startsWith("http")
            ? data.qr_value
            : `/view/${code}`;

          // Redirect based on URL type
          if (data.qr_value.startsWith("http")) {
            // External URL - use window.location for better compatibility
            window.location.href = redirectUrl;
          } else {
            // Internal route - use Next.js router
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
        setError("QR code not found");
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
