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

        // Look up the shortcode in the qr_codes table
        const { data, error } = await supabase
          .from("qr_codes")
          .select("qr_value, is_active")
          .eq("shortcode", code)
          .single();

        if (error) {
          throw error;
        }

        // Check if we found a QR code and if it's active
        if (data && data.is_active) {
          // Track the scan via API
          try {
            fetch("/api/track-scan", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                shortcode: code,
              }),
              // Use keepalive to ensure the request completes
              // even if navigation happens immediately
              keepalive: true,
            }).catch((e) => console.error("Analytics error:", e));
            // We don't await this to avoid delaying the redirect
          } catch (analyticsError) {
            // Log but don't block the redirect if analytics fails
            console.error("Analytics error:", analyticsError);
          }

          // Check if the QR value is a URL (starts with http:// or https://)
          const redirectUrl = data.qr_value.startsWith("http")
            ? data.qr_value
            : `/view/${code}`; // Fallback to a view page if not a direct URL

          // Redirect to the QR value
          router.push(redirectUrl);
        } else {
          // QR code not found or not active
          router.push("/404");
        }
      } catch (err) {
        console.error("Error fetching QR code:", err);
        setError("Failed to fetch QR code information");
        // Redirect to 404 page after error
        router.push("/404");
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
        </div>
      ) : null}
    </div>
  );
}
