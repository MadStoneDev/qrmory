// app/dashboard/page.tsx
import { createClient } from "@/utils/supabase/server";
import { SUBSCRIPTION_LEVELS, DEFAULT_QUOTAS } from "@/lib/subscription-config";
import Link from "next/link";
import {
  IconQrcode,
  IconUser,
  IconArrowRight,
  IconTrendingUp,
  IconSettings,
} from "@tabler/icons-react";

export const metadata = {
  title: "Dashboard | QRmory",
  description: "Your dashboard to manage your QRmory account",
};

// Define proper types for the data structures
interface Profile {
  id: string;
  subscription_level?: string | null;
  extra_quota_from_boosters?: number | null;
  // Add other profile fields as needed
}

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  current_period_end: string;
  // Add other subscription fields as needed
}

interface QRCodeScan {
  id: string;
  scanned_at: string;
  qr_code_id: string;
  qr_codes?: {
    name?: string;
  } | null;
}

interface UserData {
  profile: Profile | null;
  subscription: Subscription | null;
  qrCounts: {
    total: number;
    dynamic: number;
  };
  recentScans: QRCodeScan[];
}

async function fetchUserData(): Promise<UserData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: null,
      subscription: null,
      qrCounts: { total: 0, dynamic: 0 },
      recentScans: [],
    };
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return {
      profile: null,
      subscription: null,
      qrCounts: { total: 0, dynamic: 0 },
      recentScans: [],
    };
  }

  // Fetch active subscription if any
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (subscriptionError && subscriptionError.code !== "PGRST116") {
    console.error("Error fetching subscription:", subscriptionError);
  }

  // Fetch QR code counts
  const [{ count: totalCount }, { count: dynamicCount }] = await Promise.all([
    supabase
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "dynamic"),
  ]);

  // Fetch recent QR code scans (analytics)
  const { data: recentScans, error: scansError } = await supabase
    .from("qr_code_analytics")
    .select(
      `
      id,
      scanned_at,
      qr_code_id,
      qr_codes:qr_code_id (
        name
      )
    `,
    )
    .order("scanned_at", { ascending: false })
    .limit(5);

  if (scansError) {
    console.error("Error fetching QR code scans:", scansError);
  }

  return {
    profile: profile as Profile,
    subscription: subscription as Subscription | null,
    qrCounts: {
      total: totalCount || 0,
      dynamic: dynamicCount || 0,
    },
    recentScans: (recentScans as QRCodeScan[]) || [],
  };
}

export default async function DashboardPage() {
  const { profile, subscription, qrCounts, recentScans } =
    await fetchUserData();

  // If user is not logged in, redirect to login page
  if (!profile) {
    return (
      <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
        <p className="text-neutral-600 mb-4">
          You need to be logged in to view your dashboard.
        </p>
        <a
          href="/login"
          className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg"
        >
          Log In
        </a>
      </div>
    );
  }

  // Get the current subscription level (as a number)
  const currentLevel = profile.subscription_level
    ? parseInt(profile.subscription_level, 10)
    : 0;

  // Get quota information for the current subscription level
  const currentQuota =
    DEFAULT_QUOTAS.find(
      (q) =>
        q.subscription ===
        SUBSCRIPTION_LEVELS[
          currentLevel.toString() as keyof typeof SUBSCRIPTION_LEVELS
        ],
    ) || DEFAULT_QUOTAS[0];

  // Calculate total available quota
  const planQuota = currentQuota?.dynamicCodes || 0;
  const additionalQuota = profile.extra_quota_from_boosters || 0;
  const totalQuota = planQuota + additionalQuota;

  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon =
    subscription &&
    new Date(subscription.current_period_end) <
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <section className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* QR Codes Summary Card */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-qrmory-purple-100 rounded-full mr-4">
              <IconQrcode size={24} className="text-qrmory-purple-800" />
            </div>
            <h2 className="text-lg font-semibold">Your QR Codes</h2>
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold text-qrmory-purple-800">
              {qrCounts.total}
            </p>
            <p className="text-sm text-neutral-600">Total QR codes</p>
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <p className="text-xl font-semibold text-neutral-800">
                {qrCounts.total - qrCounts.dynamic}
              </p>
              <p className="text-xs text-neutral-500">Static</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-neutral-800">
                {qrCounts.dynamic}
              </p>
              <p className="text-xs text-neutral-500">Dynamic</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-neutral-800">
                {totalQuota - qrCounts.dynamic}
              </p>
              <p className="text-xs text-neutral-500">Available</p>
            </div>
          </div>

          <Link
            href="/my-codes"
            className="flex items-center justify-center text-sm font-medium text-qrmory-purple-800 hover:text-qrmory-purple-600"
          >
            View all QR codes <IconArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-qrmory-purple-100 rounded-full mr-4">
              <IconUser size={24} className="text-qrmory-purple-800" />
            </div>
            <h2 className="text-lg font-semibold">Your Subscription</h2>
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold text-qrmory-purple-800">
              {SUBSCRIPTION_LEVELS[
                currentLevel.toString() as keyof typeof SUBSCRIPTION_LEVELS
              ] || "Unknown"}
            </p>
            <p className="text-sm text-neutral-600">
              {subscription
                ? `Renews on ${new Date(
                    subscription.current_period_end,
                  ).toLocaleDateString()}`
                : "No active subscription"}
            </p>
          </div>

          <div className="mb-4 border-t border-b py-2 mt-2">
            <div className="flex justify-between">
              <p className="text-sm">Plan Quota</p>
              <p className="text-sm font-medium">
                <span className={`font-bold`}>{planQuota}</span> Dynamic codes
              </p>
            </div>
            {additionalQuota > 0 && (
              <div className="flex justify-between">
                <p className="text-sm">Additional Quota</p>
                <p className="text-sm font-medium">
                  +{additionalQuota} QR codes
                </p>
              </div>
            )}
          </div>

          {isExpiringSoon && (
            <div className="mb-4 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
              Your subscription will renew soon. Make sure your payment method
              is up to date.
            </div>
          )}

          <Link
            href="/subscription"
            className="flex items-center justify-center text-sm font-medium text-qrmory-purple-800 hover:text-qrmory-purple-600"
          >
            Manage subscription <IconArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="space-y-3">
            <Link
              href="/create"
              className="block p-3 border rounded-md hover:bg-neutral-50 flex items-center"
            >
              <IconQrcode size={20} className="mr-2 text-qrmory-purple-700" />
              Create new QR code
            </Link>

            <Link
              href="/dashboard/quota"
              className="block p-3 border rounded-md hover:bg-neutral-50 flex items-center"
            >
              <IconTrendingUp
                size={20}
                className="mr-2 text-qrmory-purple-700"
              />
              View quota usage
            </Link>

            <Link
              href="/account/settings"
              className="block p-3 border rounded-md hover:bg-neutral-50 flex items-center"
            >
              <IconSettings size={20} className="mr-2 text-qrmory-purple-700" />
              Account settings
            </Link>
          </div>
        </div>
      </div>

      {/* Recent QR Code Scans */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent QR Code Scans</h2>

        {recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Scanned At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {recentScans.map((scan) => (
                  <tr key={scan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-800">
                        {scan.qr_codes?.name || "Unnamed QR Code"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">
                        {new Date(scan.scanned_at).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-neutral-500">
            <p>
              No scans recorded yet. Share your QR codes to start tracking
              usage.
            </p>
          </div>
        )}

        <div className="mt-4 text-right">
          <Link
            href="/analytics"
            className="text-sm font-medium text-qrmory-purple-800 hover:text-qrmory-purple-600"
          >
            View all analytics{" "}
            <IconArrowRight size={16} className="ml-1 inline" />
          </Link>
        </div>
      </div>
    </section>
  );
}
