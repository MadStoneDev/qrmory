// /app/vcard/[code]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface VCardData {
  n: string;
  org?: string;
  email?: string;
  tel?: string;
  url?: string;
  title?: string;
  ts?: number;
}

export default function VCardPage() {
  const params = useParams();
  const [data, setData] = useState<VCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const code = params.code as string;
      if (!code) {
        setError("Invalid contact information");
        setLoading(false);
        return;
      }

      // Decode the base64 data
      const decodedData = decodeURIComponent(escape(atob(code)));
      const jsonData = JSON.parse(decodedData) as VCardData;

      // Validate that we have at least a name and contact method
      if (!jsonData.n || (!jsonData.email && !jsonData.tel)) {
        setError("Incomplete contact information");
      } else {
        setData(jsonData);
      }
    } catch (err) {
      console.error("Error decoding vCard data:", err);
      setError("Could not load contact information");
    } finally {
      setLoading(false);
    }
  }, [params.code]);

  // Function to add contact to device
  const downloadVCard = () => {
    if (!data) return;

    // Generate vCard format content
    let vCardContent = "BEGIN:VCARD\nVERSION:3.0\n";
    vCardContent += `FN:${data.n}\n`;
    if (data.org) vCardContent += `ORG:${data.org}\n`;
    if (data.title) vCardContent += `TITLE:${data.title}\n`;
    if (data.email) vCardContent += `EMAIL:${data.email}\n`;
    if (data.tel) vCardContent += `TEL:${data.tel}\n`;
    if (data.url) vCardContent += `URL:${data.url}\n`;
    vCardContent += "END:VCARD";

    // Create blob and download
    const blob = new Blob([vCardContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.n.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qrmory-purple-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contact information...</p>
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
              This QR code doesn't contain valid contact information.
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-qrmory-purple-800 px-6 py-4">
            <h1 className="text-white text-xl font-bold">
              Digital Business Card
            </h1>
          </div>

          {/* Contact Information */}
          <div className="p-6">
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-qrmory-purple-100 text-qrmory-purple-800 mx-auto">
              <span className="text-2xl font-bold">
                {data?.n
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-bold text-center text-gray-900">
              {data?.n}
            </h2>

            {data?.title && (
              <p className="text-gray-600 text-center">{data.title}</p>
            )}

            {data?.org && (
              <p className="text-gray-600 text-center">{data.org}</p>
            )}

            <div className="mt-8 space-y-4">
              {data?.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6 text-qrmory-purple-800 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-800">{data.email}</span>
                </a>
              )}

              {data?.tel && (
                <a
                  href={`tel:${data.tel}`}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6 text-qrmory-purple-800 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-gray-800">{data.tel}</span>
                </a>
              )}

              {data?.url && (
                <a
                  href={
                    data.url.startsWith("http")
                      ? data.url
                      : `https://${data.url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6 text-qrmory-purple-800 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span className="text-gray-800">
                    {data.url.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={downloadVCard}
                className="px-4 py-2 bg-qrmory-purple-800 text-white rounded-md hover:bg-qrmory-purple-700 focus:outline-none focus:ring-2 focus:ring-qrmory-purple-500 focus:ring-offset-2"
              >
                Save Contact
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
              Created with{" "}
              <Link href="/" className="text-qrmory-purple-800 hover:underline">
                QRmory
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
