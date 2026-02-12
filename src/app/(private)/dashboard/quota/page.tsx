// app/(private)/dashboard/quota/page.tsx
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionLevelName } from "@/lib/subscription-config";
import Link from "next/link";
import {
  getUserProfile,
  getUsedQuota,
  getTotalQuota,
  getLeftoverQuota,
  getSubscriptionPackages,
} from "@/utils/supabase/queries";

export const metadata = {
  title: "QR Code Quota",
  description: "View your QR code quota and usage statistics.",
};

export default async function QuotaPage() {
  const supabase = await createClient();

  // Fetch all data in parallel using helper functions
  const [profile, usedQuota, totalQuota, leftoverQuota, packages] =
    await Promise.all([
      getUserProfile(supabase),
      getUsedQuota(supabase),
      getTotalQuota(supabase),
      getLeftoverQuota(supabase),
      getSubscriptionPackages(supabase),
    ]);

  if (!profile) {
    return (
      <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
        <p className="text-neutral-600 mb-4">
          You need to be logged in to view your quota.
        </p>

        <Link
          href={"/login"}
          className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg"
        >
          Log In
        </Link>
      </div>
    );
  }

  const currentLevel = profile.subscription_level || 0;
  const currentPackage = packages.find((pkg) => pkg.level === currentLevel);

  // Calculate usage percentage
  const usagePercentage =
    totalQuota > 0
      ? Math.min(100, Math.round((usedQuota / totalQuota) * 100))
      : 0;

  // Determine quota status
  const isLow = leftoverQuota <= 2 && leftoverQuota > 0;
  const isOut = leftoverQuota <= 0;

  return (
    <section className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">QR Code Quota</h1>

      {/* Quota summary card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-lg font-bold text-qrmory-purple-800">
              Your QR Code Quota
            </h2>
            <p className="text-sm text-neutral-600">
              Current Plan:{" "}
              <span className="font-medium">
                {getSubscriptionLevelName(currentLevel)}
              </span>
            </p>
          </div>

          <Link
            href={`/dashboard/subscription`}
            className="mt-4 md:mt-0 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-white bg-qrmory-purple-800 hover:bg-qrmory-purple-700"
          >
            {currentLevel === 0 ? "Upgrade Plan" : "Manage Subscription"}
          </Link>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-neutral-700">
              Dynamic QR Codes Usage
            </p>
            <p className="text-sm text-neutral-600">
              {usedQuota} / {totalQuota}
            </p>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                isOut
                  ? "bg-red-600"
                  : isLow
                    ? "bg-amber-500"
                    : "bg-qrmory-purple-800"
              }`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>

          {isOut && (
            <p className="mt-2 text-sm text-red-600">
              You've used all your dynamic QR codes. Upgrade your plan.
            </p>
          )}

          {!isOut && isLow && (
            <p className="mt-2 text-sm text-amber-600">
              You're running low on dynamic QR codes.
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-50 p-4 rounded-md">
            <p className="text-sm font-medium text-neutral-700">Plan Quota</p>
            <p className="text-2xl font-bold text-qrmory-purple-800">
              {totalQuota}
            </p>
            <p className="text-xs text-neutral-500">
              Dynamic QR codes from your subscription
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-md">
            <p className="text-sm font-medium text-neutral-700">Remaining</p>
            <p
              className={`text-2xl font-bold ${
                isOut
                  ? "text-red-600"
                  : isLow
                    ? "text-amber-600"
                    : "text-green-600"
              }`}
            >
              {leftoverQuota}
            </p>
            <p className="text-xs text-neutral-500">
              Available for new QR codes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
