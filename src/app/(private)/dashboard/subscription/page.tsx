import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

import BoosterPackages from "@/components/booster-packages";
import SubscriptionStatus from "@/components/subscription-status";
import SuccessNotification from "@/components/success-notification";
import SubscriptionPlans from "@/components/subscription-plans";
import { Database } from "../../../../../database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionPackageRaw =
  Database["public"]["Tables"]["subscription_packages"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type QuotaPackage = Database["public"]["Tables"]["quota_packages"]["Row"];

interface SubscriptionPackage extends Omit<SubscriptionPackageRaw, "features"> {
  features: string[];
}

export const metadata = {
  title: "Subscription | QRmory",
  description: "Upgrade your QRmory subscription to create more QR codes.",
};

interface UserData {
  profile: Profile | null;
  mainSubscription: Subscription | null;
  boosterSubscriptions: Subscription[];
  subscriptionPackages: SubscriptionPackage[];
  quotaPackages: QuotaPackage[];
  usedDynamicQRs: number;
}

async function fetchUserData(): Promise<UserData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Still fetch subscription packages for display even if user not logged in
    const { data: subscriptionPackages, error: packagesError } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("level");

    if (packagesError) {
      console.error(
        "Error fetching subscription packages for anonymous user:",
        packagesError,
      );
    }

    return {
      profile: null,
      mainSubscription: null,
      boosterSubscriptions: [],
      subscriptionPackages:
        (subscriptionPackages as SubscriptionPackage[]) || [],
      quotaPackages: [],
      usedDynamicQRs: 0,
    };
  }

  // Fetch all data in parallel
  const [
    { data: profile, error: profileError },
    { data: mainSubscription, error: mainSubscriptionError },
    { data: boosterSubscriptions, error: boosterSubscriptionsError },
    { data: subscriptionPackages, error: packagesError },
    { data: quotaPackages, error: quotaPackagesError },
    { count: usedDynamicQRs, error: countError },
  ] = await Promise.all([
    // Fetch profile data
    supabase.from("profiles").select("*").eq("id", user.id).single(),

    // Fetch active main subscription if any
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("subscription_type", "main")
      .single(),

    // Fetch active booster subscriptions
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("subscription_type", "booster"),

    // Fetch subscription packages
    supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("level"),

    // Fetch available quota packages
    supabase
      .from("quota_packages")
      .select("*")
      .eq("is_active", true)
      .order("price_in_cents", { ascending: true }),

    // Fetch user's QR code usage
    supabase
      .from("qr_codes")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("type", "dynamic"),
  ]);

  // Log detailed errors for debugging
  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }
  if (mainSubscriptionError && mainSubscriptionError.code !== "PGRST116") {
    console.error("Error fetching main subscription:", mainSubscriptionError);
  }
  if (boosterSubscriptionsError) {
    console.error(
      "Error fetching booster subscriptions:",
      boosterSubscriptionsError,
    );
  }
  if (packagesError) {
    console.error("Error fetching packages:", packagesError);
    console.error("Packages error details:", packagesError);
  }
  if (quotaPackagesError) {
    console.error("Error fetching quota packages:", quotaPackagesError);
  }
  if (countError) {
    console.error("Error counting QR codes:", countError);
  }

  // Log what we actually got for debugging
  console.log("Fetched packages count:", subscriptionPackages?.length || 0);
  console.log("Fetched quotas count:", quotaPackages?.length || 0);

  return {
    profile: profile as Profile | null,
    mainSubscription: mainSubscription as Subscription | null,
    boosterSubscriptions: (boosterSubscriptions as Subscription[]) || [],
    subscriptionPackages: (subscriptionPackages as SubscriptionPackage[]) || [],
    quotaPackages: (quotaPackages as QuotaPackage[]) || [],
    usedDynamicQRs: usedDynamicQRs || 0,
  };
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: {
    success?: string;
    booster_success?: string;
    canceled?: string;
  };
}) {
  const {
    profile,
    mainSubscription,
    boosterSubscriptions,
    subscriptionPackages,
    quotaPackages,
    usedDynamicQRs,
  } = await fetchUserData();

  // If user is not logged in, show login prompt
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

  // Get the current subscription package
  const currentLevel = profile.subscription_level || 0;
  const currentPackage: SubscriptionPackage = subscriptionPackages.find(
    (pkg: SubscriptionPackage) => pkg.level === currentLevel,
  ) ||
    subscriptionPackages.find((pkg) => pkg.level === 0) || {
      // Fallback to free plan
      id: "fallback-free",
      name: "Free",
      description: "Basic plan with limited features",
      level: 0,
      price_in_cents: 0,
      billing_interval: "",
      quota_amount: 3,
      features: ["3 Dynamic QR codes", "Unlimited Static QR codes"],
      paddle_price_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sort_order: 0,
    };

  // Calculate total quota for usage display
  const subscriptionQuota =
    profile.dynamic_qr_quota || currentPackage.quota_amount || 0;
  const boosterQuota = profile.extra_quota_from_boosters || 0;
  const totalQuota = subscriptionQuota + boosterQuota;

  return (
    <section className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">Your Subscription</h1>

      {/* Success/Error notifications */}
      <Suspense fallback={null}>
        <SuccessNotification searchParams={searchParams} />
      </Suspense>

      {/* Display current subscription status */}
      <SubscriptionStatus
        profile={profile}
        subscription={mainSubscription}
        currentPackage={currentPackage}
        usedDynamicQRs={usedDynamicQRs}
      />

      {/* Show active booster subscriptions if any */}
      {boosterSubscriptions.length > 0 && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">
            Active Booster Subscriptions
          </h3>
          <div className="space-y-2">
            {boosterSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-orange-700">
                  {sub.plan_name || "Booster"}
                </span>
                <span className="text-orange-600 font-medium">
                  Status: {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription plans */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Upgrade Your Plan</h2>
        {subscriptionPackages.length > 0 ? (
          <SubscriptionPlans
            currentLevel={currentLevel}
            packages={subscriptionPackages}
            subscription={mainSubscription}
            usedQuota={usedDynamicQRs}
            totalQuota={totalQuota}
          />
        ) : (
          <div className="text-center p-6 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600">
              Subscription plans are being loaded. Please refresh the page if
              this persists.
            </p>
          </div>
        )}
      </div>

      {/* Booster packages */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Need More QR Codes?</h2>
        <p className="text-neutral-600 mb-4">
          Add monthly booster subscriptions to increase your quota:
        </p>
        {quotaPackages.length > 0 ? (
          <BoosterPackages packages={quotaPackages} />
        ) : (
          <div className="text-center p-6 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600">
              No booster subscriptions are currently available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
