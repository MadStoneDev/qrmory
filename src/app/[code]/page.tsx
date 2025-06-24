"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface DebugInfo {
  receivedCode: string;
  codeLength: number;
  codeCharCodes: number[];
  dbResult: any;
  error: any;
  userAgent: string;
  timestamp: string;
}

export default function CodeReroute({ params }: { params: { code: string } }) {
  const code = params.code;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        setIsLoading(true);

        // Collect debug info
        const debug: DebugInfo = {
          receivedCode: code,
          codeLength: code.length,
          codeCharCodes: Array.from(code).map((c) => c.charCodeAt(0)),
          dbResult: null,
          error: null,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        };

        // Create Supabase client
        const supabase = createClient();

        // Look up the shortcode in the qr_codes table (case sensitive)
        const { data, error: dbError } = await supabase
          .from("qr_codes")
          .select("qr_value, is_active, shortcode")
          .eq("shortcode", code)
          .single();

        debug.dbResult = data;
        debug.error = dbError;
        setDebugInfo(debug);

        if (dbError) {
          // If it's a "not found" error, show debug info instead of redirecting immediately
          if (dbError.code === "PGRST116") {
            setShowDebug(true);
            setError(`QR code '${code}' not found`);
            // Don't redirect immediately on mobile, let user see debug info
            setTimeout(() => router.push("/404"), 10000); // 10 second delay
            return;
          }
          throw dbError;
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
              keepalive: true,
            }).catch((e) => console.error("Analytics error:", e));
          } catch (analyticsError) {
            console.error("Analytics error:", analyticsError);
          }

          // Check if the QR value is a URL (starts with http:// or https://)
          const redirectUrl = data.qr_value.startsWith("http")
            ? data.qr_value
            : `/view/${code}`;

          // For mobile debugging, add a small delay and try different redirect methods
          if (
            navigator.userAgent.includes("Mobile") ||
            navigator.userAgent.includes("Android")
          ) {
            // Try window.location for mobile
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 100);
          } else {
            // Use Next.js router for desktop
            router.push(redirectUrl);
          }
        } else if (data && !data.is_active) {
          setError("QR code found but is not active");
          setShowDebug(true);
          setTimeout(() => router.push("/404"), 5000);
        } else {
          setError("QR code not found in database");
          setShowDebug(true);
          setTimeout(() => router.push("/404"), 5000);
        }
      } catch (err) {
        console.error("Error fetching QR code:", err);
        setError("Failed to fetch QR code information");
        setShowDebug(true);
        setTimeout(() => router.push("/404"), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndRedirect();
  }, [code, router]);

  // Show debug info on mobile or when there's an error
  if (showDebug && debugInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border rounded-lg p-6">
          <h1 className="text-xl font-bold mb-4 text-red-600">Debug Info</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div>
              <strong>Received Code:</strong> "{debugInfo.receivedCode}"
            </div>
            <div>
              <strong>Code Length:</strong> {debugInfo.codeLength}
            </div>
            <div>
              <strong>Character Codes:</strong> [
              {debugInfo.codeCharCodes.join(", ")}]
            </div>
            <div>
              <strong>Expected:</strong> "4GwYuT7" [52, 71, 119, 89, 117, 84,
              55]
            </div>
            <div>
              <strong>User Agent:</strong>{" "}
              {debugInfo.userAgent.substring(0, 50)}...
            </div>
            <div>
              <strong>DB Result:</strong>{" "}
              {debugInfo.dbResult ? "Found" : "Not found"}
            </div>
            {debugInfo.error && (
              <div>
                <strong>DB Error:</strong> {debugInfo.error.code} -{" "}
                {debugInfo.error.message}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => router.push("/404")}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Go to 404 Page
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show normal loading state
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
