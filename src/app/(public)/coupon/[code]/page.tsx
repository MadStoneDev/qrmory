"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CouponData {
  title: string;
  discount?: string;
  type: "percent" | "amount" | "free" | "bogo";
  desc?: string;
  cta: string;
  color: string;
  theme: "light" | "dark";
  exp?: string;
  biz: string;
  ts?: number;
}

export default function CouponPage() {
  const params = useParams();
  const [data, setData] = useState<CouponData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    try {
      const code = params.code as string;
      if (!code) {
        setError("Invalid coupon information");
        setLoading(false);
        return;
      }

      // Decode the base64 data
      const decodedData = decodeURIComponent(escape(atob(code)));
      const jsonData = JSON.parse(decodedData) as CouponData;

      // Only require the title, make business name, discount, and description optional
      if (!jsonData.title) {
        setError("Incomplete coupon information - missing title");
      } else {
        // Apply default values for optional fields
        if (!jsonData.biz) {
          jsonData.biz = "Special Offer";
        }

        // The discount can be missing for "free" or "bogo" type coupons
        if (
          !jsonData.discount &&
          jsonData.type !== "free" &&
          jsonData.type !== "bogo"
        ) {
          jsonData.discount = "";
        }

        // Description is already optional

        setData(jsonData);

        // Check if the coupon is expired
        if (jsonData.exp) {
          const expiryDate = new Date(jsonData.exp);
          const now = new Date();
          if (now > expiryDate) {
            setIsExpired(true);
          }
        }
      }
    } catch (err) {
      console.error("Error decoding coupon data:", err);
      setError("Could not load coupon information");
    } finally {
      setLoading(false);
    }
  }, [params.code]);

  // Format discount based on type
  const formatDiscount = () => {
    if (!data) return "";

    switch (data.type) {
      case "percent":
        return `${data.discount}% OFF`;
      case "amount":
        return `$${data.discount} OFF`;
      case "free":
        return "FREE";
      case "bogo":
        return "BUY ONE GET ONE";
      default:
        return data.discount || "";
    }
  };

  // Helper function to convert hex to rgba for background
  const hexToRgba = (hex: string, opacity: number = 0.15): string => {
    const normalizedHex = hex.startsWith("#") ? hex : `#${hex}`;

    // Convert 3-digit hex to 6-digit
    const fullHex =
      normalizedHex.length === 4
        ? `#${normalizedHex[1]}${normalizedHex[1]}${normalizedHex[2]}${normalizedHex[2]}${normalizedHex[3]}${normalizedHex[3]}`
        : normalizedHex;

    // Extract rgb values
    const r = parseInt(fullHex.slice(1, 3), 16);
    const g = parseInt(fullHex.slice(3, 5), 16);
    const b = parseInt(fullHex.slice(5, 7), 16);

    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qrmory-purple-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading coupon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6">
            <svg
              className="w-12 h-12 text-rose-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-xl font-bold mt-4 text-gray-800">{error}</h1>
            <p className="mt-2 text-gray-600">
              This QR code doesn't contain valid coupon information.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-qrmory-purple-800 text-white rounded hover:bg-qrmory-purple-700"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const brandColor = `#${data?.color || "3B82F6"}`;
  const softBgColor = hexToRgba(brandColor, 0.12);
  const isDarkTheme = data?.theme === "dark";
  const bgColor = isDarkTheme ? "#212121" : "white";
  const textColor = isDarkTheme ? "white" : "#212121";

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4"
      style={{ backgroundColor: "#f9fafb" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{ backgroundColor: "white" }}
        >
          {/* Coupon Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Special Offer</h1>
          </div>

          {isExpired && (
            <div className="mx-6 mt-4 py-2 px-4 bg-rose-100 text-rose-800 rounded-md text-center">
              This coupon has expired
            </div>
          )}

          {/* Coupon Content */}
          <div
            className="m-4 p-6 rounded-lg"
            style={{ backgroundColor: softBgColor }}
          >
            <div className="mb-3 text-xl font-serif text-neutral-900 text-center">
              {data?.biz}
            </div>

            <section
              className={`pt-5 pb-3 rounded-md text-center ${
                isDarkTheme
                  ? "text-white bg-neutral-900"
                  : "text-neutral-900 bg-white"
              }`}
            >
              <div
                className="mb-5 inline-block px-3 py-1 rounded-full text-white font-semibold"
                style={{ backgroundColor: brandColor }}
              >
                {formatDiscount()}
              </div>

              <div className="text-xl font-bold">{data?.title}</div>

              {data?.desc && (
                <div
                  className={`mx-auto mt-2 text-sm max-w-56 ${
                    isDarkTheme ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {data.desc}
                </div>
              )}

              <button
                className="mt-8 px-4 py-2 rounded-md text-white font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: brandColor }}
                disabled={isExpired}
                onClick={() => alert("Coupon redeemed!")}
              >
                {data?.cta || "Redeem Offer"}
              </button>

              {data?.exp && (
                <div
                  className={`mt-2 text-xs ${
                    isDarkTheme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {isExpired ? "Expired on:" : "Valid until:"}{" "}
                  {new Date(data.exp).toLocaleDateString()}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 text-center border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Present this coupon at time of purchase. Cannot be combined with
              other offers.
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Created with{" "}
              <Link href="/" className="text-qrmory-purple-800 hover:underline">
                QRmory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
