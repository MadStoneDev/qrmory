// /[code]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Subscription levels that get branded redirect (Free = 0, Explorer = 1)
const BRANDED_REDIRECT_LEVELS = [0, 1];

export default function CodeReroute({ params }: { params: { code: string } }) {
  const code = params.code;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBranding, setShowBranding] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        setIsLoading(true);

        // Create Supabase client
        const supabase = createClient();

        // Look up the shortcode in the qr_codes table with owner's subscription level
        const { data, error: dbError } = await supabase
          .from("qr_codes")
          .select(`
            qr_value,
            is_active,
            user_id,
            profiles!inner(subscription_level)
          `)
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
          const targetUrl = data.qr_value.startsWith("http")
            ? data.qr_value
            : `/view/${code}`;

          // Check owner's subscription level for branding
          const ownerLevel = (data.profiles as any)?.subscription_level ?? 0;
          const shouldShowBranding = BRANDED_REDIRECT_LEVELS.includes(ownerLevel);

          if (shouldShowBranding) {
            // Show branded redirect page briefly, then redirect
            setShowBranding(true);
            setRedirectUrl(targetUrl);
            setIsLoading(false);

            // Brief delay to show branding, then redirect
            setTimeout(() => {
              performRedirect(targetUrl, data.qr_value.startsWith("http"));
            }, 1500);
          } else {
            // Instant redirect for premium users (Creator/Champion)
            performRedirect(targetUrl, data.qr_value.startsWith("http"));
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

    const performRedirect = (url: string, isExternal: boolean) => {
      if (isExternal) {
        window.location.href = url;
      } else {
        router.push(url);
      }
    };

    fetchAndRedirect();
  }, [code, router]);

  // Branded redirect page (Free & Explorer tiers)
  if (showBranding && redirectUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          {/* QRmory Logo */}
          <p className="text-sm font-medium text-qrmory-purple-800 mb-4">
            QRmory
          </p>

          {/* Redirect message */}
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <div className="animate-spin h-10 w-10 border-4 border-qrmory-purple-800 rounded-full border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  // Loading/Error states
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {isLoading ? (
        <div className="text-center">
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
