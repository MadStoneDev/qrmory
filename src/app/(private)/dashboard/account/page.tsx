// src/app/(private)/dashboard/account/page.tsx
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionLevelName } from "@/lib/subscription-config";
import Link from "next/link";
import {
  IconMail,
  IconCalendar,
  IconCreditCard,
  IconQrcode,
  IconChevronRight,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  getUser,
  getUserProfile,
  getSubscription,
  getUsedQuota,
  getTotalQuota,
  getLeftoverQuota,
} from "@/utils/supabase/queries";

export const metadata = {
  title: "Account Info",
  description:
    "Manage your QRmory account settings and view account information.",
};

async function getUserData() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) return null;

  const [
    profile,
    subscription,
    usedQuota,
    totalQuota,
    leftoverQuota,
    { count: totalQRCount },
  ] = await Promise.all([
    getUserProfile(supabase),
    getSubscription(supabase),
    getUsedQuota(supabase),
    getTotalQuota(supabase),
    getLeftoverQuota(supabase),
    supabase
      .from("qr_codes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return {
    user,
    profile,
    subscription,
    usedQuota,
    totalQuota,
    leftoverQuota,
    totalQRCount: totalQRCount || 0,
  };
}

export default async function AccountInfo() {
  const userData = await getUserData();

  if (!userData) {
    return (
      <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
        <p className="text-neutral-600 mb-4">
          You need to be logged in to view your account information.
        </p>
        <Link
          href="/login"
          className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  const {
    user,
    profile,
    subscription,
    usedQuota,
    totalQuota,
    leftoverQuota,
    totalQRCount,
  } = userData;
  const subscriptionLevel = profile?.subscription_level || 0;
  const usagePercentage =
    totalQuota > 0 ? Math.round((usedQuota / totalQuota) * 100) : 0;
  const isNearLimit = leftoverQuota <= 2 && leftoverQuota > 0;
  const isAtLimit = leftoverQuota <= 0;

  return (
    <div className="flex flex-col w-full space-y-6">
      <h1 className="mb-4 text-xl font-bold">Account</h1>

      {/* Quota Warning */}
      {(isNearLimit || isAtLimit) && (
        <div
          className={`rounded-lg border p-4 ${
            isAtLimit
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <IconAlertCircle
              className={isAtLimit ? "text-red-600" : "text-amber-600"}
              size={20}
            />
            <div className="flex-1">
              <p
                className={`font-medium ${
                  isAtLimit ? "text-red-900" : "text-amber-900"
                }`}
              >
                {isAtLimit
                  ? "Dynamic QR quota reached"
                  : "Running low on dynamic QR codes"}
              </p>
              <p
                className={`text-sm mt-1 ${
                  isAtLimit ? "text-red-700" : "text-amber-700"
                }`}
              >
                {isAtLimit
                  ? "You've used all your dynamic QR codes. Upgrade to create more."
                  : `Only ${leftoverQuota} dynamic QR code${
                      leftoverQuota === 1 ? "" : "s"
                    } remaining.`}
              </p>
              <Link
                href="/dashboard/subscription"
                className={`inline-block mt-2 text-sm font-medium underline ${
                  isAtLimit ? "text-red-800" : "text-amber-800"
                }`}
              >
                Upgrade plan →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Usage Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-6">Usage Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Plan</p>
            <p className="text-2xl font-bold text-neutral-900">
              {getSubscriptionLevelName(subscriptionLevel)}
            </p>
            {subscription && (
              <p className="text-xs text-neutral-500 mt-1">
                Renews{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-neutral-500 mb-1">Dynamic QR Codes</p>
            <p className="text-2xl font-bold text-neutral-900">
              {usedQuota} / {totalQuota}
            </p>
            <div className="mt-2">
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isAtLimit
                      ? "bg-red-600"
                      : isNearLimit
                        ? "bg-amber-500"
                        : "bg-qrmory-purple-800"
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-500 mb-1">Total QR Codes</p>
            <p className="text-2xl font-bold text-neutral-900">
              {totalQRCount}
            </p>
            <p className="text-xs text-neutral-500 mt-1">All types</p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Account Details</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-3">
              <IconMail className="text-neutral-400" size={20} />
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="text-neutral-900">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <IconCalendar className="text-neutral-400" size={20} />
              <div>
                <p className="text-sm text-neutral-500">Member Since</p>
                <p className="text-neutral-900">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Manage</h2>
        <div className="space-y-2">
          <Link
            href="/dashboard/subscription"
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <IconCreditCard size={20} className="text-neutral-600" />
              <div>
                <p className="font-medium">Subscription</p>
                <p className="text-xs text-neutral-500">
                  Manage billing and plan
                </p>
              </div>
            </div>
            <IconChevronRight
              size={20}
              className="text-neutral-400 group-hover:text-neutral-600"
            />
          </Link>

          <Link
            href="/dashboard/my-codes"
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <IconQrcode size={20} className="text-neutral-600" />
              <div>
                <p className="font-medium">My QR Codes</p>
                <p className="text-xs text-neutral-500">
                  View and manage your codes
                </p>
              </div>
            </div>
            <IconChevronRight
              size={20}
              className="text-neutral-400 group-hover:text-neutral-600"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
