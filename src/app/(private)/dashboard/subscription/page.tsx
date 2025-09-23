// Simplified page.tsx - removes all booster complexity
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

import SubscriptionStatus from "@/components/subscription-status";
import SuccessNotification from "@/components/success-notification";
import SubscriptionPlans from "@/components/subscription-plans";
import { Database } from "../../../../../database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionPackageRaw =
  Database["public"]["Tables"]["subscription_packages"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionPackage extends Omit<SubscriptionPackageRaw, "features"> {
  features: string[];
}

export const metadata = {
  title: "Subscription | QRmory",
  description: "Upgrade your QRmory subscription to create more QR codes.",
};

interface UserData {
  profile: Profile | null;
  subscription: Subscription | null;
  subscriptionPackages: SubscriptionPackage[];
  usedDynamicQRs: number;
}

async function fetchUserData(): Promise<UserData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data: subscriptionPackages } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("level");

    return {
      profile: null,
      subscription: null,
      subscriptionPackages:
        (subscriptionPackages as SubscriptionPackage[]) || [],
      usedDynamicQRs: 0,
    };
  }

  // Simplified parallel fetch - only what we need
  const [
    { data: profile },
    { data: subscription },
    { data: subscriptionPackages },
    { count: usedDynamicQRs },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),

    // Only fetch main subscription - simplified
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(), // Use maybeSingle to avoid error when no subscription exists

    supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("level"),

    supabase
      .from("qr_codes")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("type", "dynamic"),
  ]);

  return {
    profile: profile as Profile | null,
    subscription: subscription as Subscription | null,
    subscriptionPackages: (subscriptionPackages as SubscriptionPackage[]) || [],
    usedDynamicQRs: usedDynamicQRs || 0,
  };
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
}) {
  const { profile, subscription, subscriptionPackages, usedDynamicQRs } =
    await fetchUserData();

  if (!profile) {
    return (
      <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
        <p className="text-neutral-600 mb-4">
          You need to be logged in to view subscription options.
        </p>
        <a
          href="/login"
          className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
        >
          Log In
        </a>
      </div>
    );
  }

  const currentLevel = profile.subscription_level || 0;
  const currentPackage: SubscriptionPackage = subscriptionPackages.find(
    (pkg) => pkg.level === currentLevel,
  ) ||
    subscriptionPackages.find((pkg) => pkg.level === 0) || {
      id: "fallback-free",
      name: "Free",
      description: "Basic plan with limited features",
      level: 0,
      price_in_cents: 0,
      billing_interval: "month",
      quota_amount: 3,
      features: ["3 Dynamic QR codes", "Unlimited Static QR codes"],
      paddle_price_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sort_order: 0,
    };

  // Simplified quota calculation - no boosters
  const totalQuota =
    profile.dynamic_qr_quota || currentPackage.quota_amount || 0;

  return (
    <section className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">Your Subscription</h1>

      <Suspense fallback={null}>
        <SuccessNotification searchParams={searchParams} />
      </Suspense>

      <SubscriptionStatus
        profile={profile}
        subscription={subscription}
        currentPackage={currentPackage}
        usedDynamicQRs={usedDynamicQRs}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
        {subscriptionPackages.length > 0 ? (
          <SubscriptionPlans
            profile={profile}
            currentLevel={currentLevel}
            packages={subscriptionPackages}
            subscription={subscription}
            usedQuota={usedDynamicQRs}
            totalQuota={totalQuota}
          />
        ) : (
          <div className="text-center p-6 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600">
              Subscription plans are loading. Please refresh if this persists.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
