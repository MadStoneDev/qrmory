// src/app/(private)/dashboard/subscription/page.tsx
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

import SubscriptionStatus from "@/components/subscription-status";
import SuccessNotification from "@/components/success-notification";
import SubscriptionPlans from "@/components/subscription-plans";
import {
  ensurePaddleCustomer,
  ensureUserProfile,
  getSubscription,
  getSubscriptionPackages,
  getUsedQuota,
  getTotalQuota,
} from "@/utils/supabase/queries";
import Link from "next/link";

export const metadata = {
  title: "Subscription",
  description: "Upgrade your QRmory subscription to create more QR codes.",
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
}) {
  const supabase = await createClient();

  // Ensure profile and Paddle customer exist
  const profile = await ensureUserProfile(supabase);
  await ensurePaddleCustomer(supabase);

  if (!profile) {
    return (
      <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
        <p className="text-neutral-600 mb-4">
          You need to be logged in to view subscription options.
        </p>

        <Link
          href={`/login`}
          className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  // Fetch all data in parallel using our helper functions
  const [subscription, subscriptionPackages, usedQuota, totalQuota] =
    await Promise.all([
      getSubscription(supabase),
      getSubscriptionPackages(supabase),
      getUsedQuota(supabase),
      getTotalQuota(supabase),
    ]);

  const currentLevel = profile.subscription_level || 0;
  const currentPackage =
    subscriptionPackages.find((pkg) => pkg.level === currentLevel) ||
    subscriptionPackages.find((pkg) => pkg.level === 0);

  if (!currentPackage) {
    return <div>Error loading subscription data</div>;
  }

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
        usedDynamicQRs={usedQuota}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
        {subscriptionPackages.length > 0 ? (
          <SubscriptionPlans
            profile={profile}
            currentLevel={currentLevel}
            packages={subscriptionPackages}
            subscription={subscription}
            usedQuota={usedQuota}
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
