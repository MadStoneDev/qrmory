import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

import BoosterPackages from "@/components/booster-packages";
import SubscriptionStatus from "@/components/subscription-status";
import SuccessNotification from "@/components/success-notification";
import SubscriptionPlans, {
  type SubscriptionPackage,
  type Subscription,
} from "@/components/subscription-plans";

export const metadata = {
  title: "Subscription | QRmory",
  description: "Upgrade your QRmory subscription to create more QR codes.",
};

// Define proper types for the data structures
interface Profile {
  id: string;
  subscription_level?: number | null;
  extra_quota_from_boosters?: number | null;
  dynamic_qr_quota?: number | null;
}

interface QuotaPackage {
  id: string;
  name: string;
  quantity: number;
  price_in_cents: number;
  is_active: boolean;
  description?: string;
  stripe_price_id: string;
}

interface UserData {
  profile: Profile | null;
  subscription: Subscription | null;
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
    const { data: subscriptionPackages } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("level"); // Changed from sort_order to level for consistency

    return {
      profile: null,
      subscription: null,
      subscriptionPackages: subscriptionPackages || [],
      quotaPackages: [],
      usedDynamicQRs: 0,
    };
  }

  // Fetch all data in parallel
  const [
    { data: profile, error: profileError },
    { data: subscription, error: subscriptionError },
    { data: subscriptionPackages, error: packagesError },
    { data: quotaPackages, error: quotaPackagesError },
    { count: usedDynamicQRs, error: countError },
  ] = await Promise.all([
    // Fetch profile data
    supabase.from("profiles").select("*").eq("id", user.id).single(),

    // Fetch active subscription if any
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single(),

    // Fetch subscription packages
    supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("level"), // Changed from sort_order to level

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

  // Log errors (but don't fail completely)
  if (profileError) console.error("Error fetching profile:", profileError);
  if (subscriptionError && subscriptionError.code !== "PGRST116") {
    console.error("Error fetching subscription:", subscriptionError);
  }
  if (packagesError) console.error("Error fetching packages:", packagesError);
  if (quotaPackagesError)
    console.error("Error fetching quota packages:", quotaPackagesError);
  if (countError) console.error("Error counting QR codes:", countError);

  return {
    profile: profile as Profile | null,
    subscription: subscription as Subscription | null,
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
    subscription,
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
  const currentPackage = subscriptionPackages.find(
    (pkg) => pkg.level === currentLevel,
  ) ||
    subscriptionPackages.find((pkg) => pkg.level === 0) || {
      // Fallback to free plan
      // Final fallback if no packages exist in database
      id: "fallback-free",
      name: "Free",
      description: "Basic plan with limited features",
      level: 0,
      price_in_cents: 0,
      quota_amount: 3,
      features: ["3 Dynamic QR codes", "Unlimited Static QR codes"],
      stripe_price_id: null,
      is_active: true,
    };

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
        subscription={subscription}
        currentPackage={currentPackage}
        usedDynamicQRs={usedDynamicQRs}
      />

      {/* Subscription plans */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Upgrade Your Plan</h2>
        {subscriptionPackages.length > 0 ? (
          <SubscriptionPlans
            currentLevel={currentLevel}
            packages={subscriptionPackages}
            subscription={subscription}
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
          Boost your quota with these one-time purchases:
        </p>
        {quotaPackages.length > 0 ? (
          <BoosterPackages packages={quotaPackages} />
        ) : (
          <div className="text-center p-6 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600">
              No booster packages are currently available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
