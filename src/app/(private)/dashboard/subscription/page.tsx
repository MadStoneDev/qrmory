import { createClient } from "@/utils/supabase/server";

import BoosterPackages from "@/components/booster-packages";
import SubscriptionPlans from "@/components/subscription-plans";
import SubscriptionStatus from "@/components/subscription-status";

import { SUBSCRIPTION_LEVELS, DEFAULT_QUOTAS } from "@/lib/subscription-config";

export const metadata = {
  title: "Subscription | QRmory",
  description: "Upgrade your QRmory subscription to create more QR codes.",
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

interface QuotaPackage {
  id: string;
  name: string;
  quantity: number;
  price_in_cents: number;
  is_active: boolean;
  // Add other package fields as needed
}

interface UserData {
  profile: Profile | null;
  subscription: Subscription | null;
  quota_packages: QuotaPackage[];
  usedDynamicQRs: number;
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
      quota_packages: [],
      usedDynamicQRs: 0,
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
      quota_packages: [],
      usedDynamicQRs: 0,
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

  // Fetch available quota packages
  const { data: quota_packages, error: packagesError } = await supabase
    .from("quota_packages")
    .select("*")
    .eq("is_active", true)
    .order("price_in_cents", { ascending: true });

  if (packagesError) {
    console.error("Error fetching quota packages:", packagesError);
  }

  // Fetch user's QR code usage
  const { count: usedDynamicQRs, error: countError } = await supabase
    .from("qr_codes")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .eq("type", "dynamic");

  if (countError) {
    console.error("Error counting QR codes:", countError);
  }

  return {
    profile: profile as Profile,
    subscription: subscription as Subscription | null,
    quota_packages: (quota_packages as QuotaPackage[]) || [],
    usedDynamicQRs: usedDynamicQRs || 0,
  };
}

export default async function SubscriptionPage() {
  const { profile, subscription, quota_packages, usedDynamicQRs } =
    await fetchUserData();

  // If user is not logged in, redirect to login page
  if (!profile) {
    return (
      <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
        <p className="text-neutral-600 mb-4">
          You need to be logged in to view subscription options.
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

  return (
    <section className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">Your Subscription</h1>

      {/* Display current subscription status */}
      <SubscriptionStatus
        profile={profile}
        subscription={subscription}
        currentQuota={currentQuota}
        usedDynamicQRs={usedDynamicQRs}
      />

      {/* Subscription plans */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Upgrade Your Plan</h2>
        <SubscriptionPlans
          currentLevel={currentLevel}
          quotas={DEFAULT_QUOTAS}
          subscription={subscription}
        />
      </div>

      {/* Booster packages */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Need More QR Codes?</h2>
        <p className="text-neutral-600 mb-4">
          Boost your quota with these one-time purchases:
        </p>
        <BoosterPackages packages={quota_packages} />
      </div>
    </section>
  );
}
