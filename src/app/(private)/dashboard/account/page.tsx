// app/account/page.tsx
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionLevelName } from "@/lib/subscription-config";
import Link from "next/link";
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconCreditCard,
  IconSettings,
  IconQrcode,
  IconEye,
} from "@tabler/icons-react";

export const metadata = {
  title: "Account Info | QRmory",
  description:
    "Manage your QRmory account settings and view account information.",
};

async function getUserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get profile and subscription data
  const [
    { data: profile },
    { data: mainSub },
    { data: boosterSubs },
    { count: qrCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("subscription_type", "main")
      .eq("status", "active")
      .single(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("subscription_type", "booster")
      .eq("status", "active"),
    supabase
      .from("qr_codes")
      .select("id", { count: "exact" })
      .eq("user_id", user.id),
  ]);

  return {
    user,
    profile,
    mainSubscription: mainSub,
    boosterSubscriptions: boosterSubs || [],
    totalQRCodes: qrCount || 0,
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
    mainSubscription,
    boosterSubscriptions,
    totalQRCodes,
  } = userData;
  const subscriptionLevel = profile?.subscription_level || 0;
  const totalQuota = profile?.dynamic_qr_quota || 3;

  return (
    <div className="flex flex-col w-full space-y-6">
      <h1 className="mb-4 text-xl font-bold">Account Information</h1>

      {/* Account Overview Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-qrmory-purple-100 rounded-full flex items-center justify-center">
            <IconUser className="text-qrmory-purple-800" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Account Details</h2>
            <p className="text-sm text-neutral-600">
              Manage your account information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <IconMail className="text-neutral-400" size={18} />
              <div>
                <p className="text-sm font-medium text-neutral-700">Email</p>
                <p className="text-neutral-800">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IconCalendar className="text-neutral-400" size={18} />
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Member Since
                </p>
                <p className="text-neutral-800">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <IconCreditCard className="text-neutral-400" size={18} />
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Subscription
                </p>
                <p className="text-neutral-800">
                  {getSubscriptionLevelName(subscriptionLevel)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IconQrcode className="text-neutral-400" size={18} />
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  QR Codes Created
                </p>
                <p className="text-neutral-800">{totalQRCodes} total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Quota Usage</p>
              <p className="text-2xl font-bold text-blue-900">
                {Math.round((totalQRCodes / totalQuota) * 100)}%
              </p>
            </div>
            <IconQrcode className="text-blue-600" size={28} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                Active Subscriptions
              </p>
              <p className="text-2xl font-bold text-green-900">
                {(mainSubscription ? 1 : 0) + boosterSubscriptions.length}
              </p>
            </div>
            <IconCreditCard className="text-green-600" size={28} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">
                Account Status
              </p>
              <p className="text-lg font-bold text-purple-900">
                {profile?.subscription_status === "active" ? "Active" : "Free"}
              </p>
            </div>
            <IconSettings className="text-purple-600" size={28} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href={`/dashboard/subscription`}
            className="flex items-center justify-center gap-2 p-3 bg-qrmory-purple-50 border border-qrmory-purple-200 rounded-lg hover:bg-qrmory-purple-100 transition-colors"
          >
            <IconCreditCard size={18} />
            <span className="text-sm font-medium">Manage Subscription</span>
          </Link>

          <Link
            href={`/dashboard/quota`}
            className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <IconQrcode size={18} />
            <span className="text-sm font-medium">View Quota</span>
          </Link>

          <Link
            href={`/dashboard/analytics`}
            className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <IconEye size={18} />
            <span className="text-sm font-medium">View Analytics</span>
          </Link>

          <Link
            href={`/qr-codes`}
            className="flex items-center justify-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <IconQrcode size={18} />
            <span className="text-sm font-medium">My QR Codes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
