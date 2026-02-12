// app/(private)/dashboard/batch/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import BatchQRGenerator from "@/components/batch-qr-generator";

export const metadata: Metadata = {
  title: "Batch QR Code Generator",
  description:
    "Create multiple QR codes at once with pattern-based naming. Perfect for restaurants, hotels, and warehouses.",
};

// Default patterns for different use cases
const defaultPatterns = [
  {
    label: "Tables",
    pattern: "Table {n}",
    valuePattern: "https://example.com/menu/table/{n}",
    defaultRange: [1, 20] as [number, number],
  },
  {
    label: "Rooms",
    pattern: "Room {n}",
    valuePattern: "https://example.com/info/room/{n}",
    defaultRange: [101, 120] as [number, number],
  },
  {
    label: "Products",
    pattern: "Product #{n}",
    valuePattern: "https://example.com/product/{n}",
    defaultRange: [1, 50] as [number, number],
  },
  {
    label: "Stations",
    pattern: "Station {n}",
    valuePattern: "https://example.com/station/{n}",
    defaultRange: [1, 10] as [number, number],
  },
];

export default async function BatchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to check subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_level")
    .eq("id", user.id)
    .single();

  const subscriptionLevel = profile?.subscription_level || 0;

  // Check if user can access batch generation
  const canAccessBatch = subscriptionLevel >= 1;

  return (
    <main className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-qrmory-purple-800 font-serif mb-2">
            Batch QR Code Generator
          </h1>
          <p className="text-neutral-600">
            Create multiple QR codes at once using pattern-based naming.
          </p>
        </div>

        {/* Subscription gate */}
        {!canAccessBatch ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200 text-center">
            <div className="w-16 h-16 bg-qrmory-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-qrmory-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-qrmory-purple-800 mb-2">
              Upgrade to Access Batch Generation
            </h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Batch QR code generation is available on Explorer, Creator, and
              Champion plans. Upgrade now to create multiple QR codes at once.
            </p>
            <a
              href="/dashboard/subscription"
              className="inline-flex items-center px-6 py-3 bg-qrmory-purple-800 text-white font-semibold rounded-lg hover:bg-qrmory-purple-700 transition-colors"
            >
              Upgrade Now
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-neutral-200">
            <BatchQRGenerator suggestedPatterns={defaultPatterns} />
          </div>
        )}

        {/* Help section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-100">
            <h3 className="font-semibold text-qrmory-purple-800 mb-2">
              How patterns work
            </h3>
            <p className="text-sm text-neutral-600">
              Use <code className="bg-neutral-100 px-1 rounded">{"{n}"}</code>{" "}
              as a placeholder for numbers. The generator will replace it with
              each number in your range.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-100">
            <h3 className="font-semibold text-qrmory-purple-800 mb-2">
              Batch limits
            </h3>
            <p className="text-sm text-neutral-600">
              Explorer: up to 10 codes per batch
              <br />
              Creator: up to 25 codes per batch
              <br />
              Champion: up to 50 codes per batch
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-100">
            <h3 className="font-semibold text-qrmory-purple-800 mb-2">
              Download formats
            </h3>
            <p className="text-sm text-neutral-600">
              All batch-created QR codes can be downloaded as a ZIP file
              containing SVG files. Print-ready and vector-perfect.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
