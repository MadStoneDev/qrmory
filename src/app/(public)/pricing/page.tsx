// /app/pricing/page.tsx
import { createClient } from "@/utils/supabase/server";
import React, { Suspense } from "react";

import SuccessNotification from "@/components/success-notification";
import SubscriptionPlans from "@/components/subscription-plans";
import { Database } from "../../../../database.types";
import MainNavigation from "@/components/main-navigation";
import MainFooter from "@/components/sections/main-footer";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionPackageRaw =
  Database["public"]["Tables"]["subscription_packages"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionPackage extends Omit<SubscriptionPackageRaw, "features"> {
  features: string[];
}

export const metadata = {
  title: "Pricing | QRmory",
  description: "QRmory provides competitive pricing for more QR codes..",
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

  const currentLevel = profile ? profile.subscription_level : 0;

  // Simplified quota calculation - no boosters
  const totalQuota = profile ? profile.dynamic_qr_quota : 0;

  return (
    <>
      <main className="mb-8 flex flex-col items-center justify-between">
        <MainNavigation />
        <section className="py-32 pb-10 px-6 lg:px-12 bg-neutral-100 w-full rounded-lg text-qrmory-purple-800 text-center">
          <h1 className="mb-4 text-xl font-bold">Pricing</h1>

          <Suspense fallback={null}>
            <SuccessNotification searchParams={searchParams} />
          </Suspense>

          <div className="mt-8">
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
                  Loading pricing tables. Please wait.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <MainFooter />
    </>
  );
}
