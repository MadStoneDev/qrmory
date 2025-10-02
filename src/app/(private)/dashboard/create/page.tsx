// src/app/(private)/dashboard/create/page.tsx
import { createClient } from "@/utils/supabase/server";
import QRCreator from "@/components/qr-create/qr-creator";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import {
  getUser,
  getUserProfile,
  getUserSettings,
  getUsedQuota,
  getTotalQuota,
} from "@/utils/supabase/queries";

export const metadata = {
  title: "Create a QR Code | QRmory",
  description: "Create a QR Code to share with your friends and family.",
};

export default async function Create() {
  const supabase = await createClient();

  const [user, profile, userSettings, usedQuota, totalQuota] =
    await Promise.all([
      getUser(supabase),
      getUserProfile(supabase),
      getUserSettings(supabase),
      getUsedQuota(supabase),
      getTotalQuota(supabase),
    ]);

  const settings = {
    ...DEFAULT_SETTINGS,
    ...(userSettings?.settings || {}),
  };

  const quotaInfo = {
    currentCount: usedQuota,
    maxQuota: totalQuota,
    subscriptionLevel: profile?.subscription_level || "free",
    subscriptionStatus: profile?.subscription_status || "inactive",
  };

  return (
    <section className="flex flex-col overflow-y-auto">
      <h1 className="mb-4 text-xl font-bold">Create</h1>
      <QRCreator
        withHeading={false}
        user={user}
        userSettings={settings}
        quotaInfo={quotaInfo}
      />
    </section>
  );
}
