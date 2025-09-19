// app/account/quota/page.tsx
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionLevelName } from "@/lib/subscription-config";
import Link from "next/link";
import { Database } from "../../../../../database.types";

export const metadata = {
  title: "QR Code Quota | QRmory",
  description: "View your QR code quota and usage statistics.",
};

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type SubscriptionPackage =
  Database["public"]["Tables"]["subscription_packages"]["Row"];

interface UserData {
  profile: Profile | null;
  dynamicQRCount: number;
  currentPackage: SubscriptionPackage | null;
}

async function fetchUserData(): Promise<UserData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: null,
      dynamicQRCount: 0,
      currentPackage: null,
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
      dynamicQRCount: 0,
      currentPackage: null,
    };
  }

  // Fetch user's QR code usage
  const { count: dynamicQRCount, error: countError } = await supabase
    .from("qr_codes")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .eq("type", "dynamic");

  if (countError) {
    console.error("Error counting QR codes:", countError);
  }

  // Get current subscription package
  const currentLevel = profile.subscription_level || 0;
  const { data: currentPackage } = await supabase
    .from("subscription_packages")
    .select("*")
    .eq("level", currentLevel)
    .eq("is_active", true)
    .single();

  return {
    profile: profile as Profile,
    dynamicQRCount: dynamicQRCount || 0,
    currentPackage: currentPackage as SubscriptionPackage | null,
  };
}

export default async function QuotaPage() {
  const { profile, dynamicQRCount, currentPackage } = await fetchUserData();

  if (!profile) {
    return (
      <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
        <p className="text-neutral-600 mb-4">
          You need to be logged in to view your quota.
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
  const currentLevel = profile.subscription_level || 0;

  // Use currentPackage or fallback
  const packageToDisplay = currentPackage || {
    id: "fallback-free",
    name: "Free",
    description: "Basic plan with limited features",
    level: 0,
    price_in_cents: 0,
    quota_amount: 3,
    features: ["3 Dynamic QR codes", "Unlimited Static QR codes"],
    paddle_price_id: null,
    is_active: true,
  };

  // Calculate total available quota
  const planQuota =
    profile.dynamic_qr_quota || packageToDisplay.quota_amount || 3;
  const totalQuota = planQuota;

  // Calculate usage percentage
  const usagePercentage = Math.min(
    100,
    Math.round((dynamicQRCount / totalQuota) * 100),
  );

  // Determine quota status
  const quotaRemaining = totalQuota - dynamicQRCount;
  const isLow = quotaRemaining <= 2;
  const isOut = quotaRemaining <= 0;

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
              {dynamicQRCount} / {totalQuota}
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
              {planQuota}
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
              {quotaRemaining}
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
