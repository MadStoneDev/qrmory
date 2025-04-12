import { createClient } from "@/utils/supabase/server";
import QRCreator from "@/components/qr-create/qr-creator";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";

export const metadata = {
  title: "Create a QR Code | QRmory",
  description: "Create a QR Code to share with your friends and family.",
};

async function fetchUserProfile(userId: string) {
  if (!userId) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_level, dynamic_qr_quota, subscription_status")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

async function fetchUserSettings(userId: string) {
  if (!userId) return DEFAULT_SETTINGS;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("settings")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user settings:", error);
    return DEFAULT_SETTINGS;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...data.settings,
  };
}

async function fetchUserDynamicQRCount(userId: string) {
  if (!userId) return 0;

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("qr_codes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "dynamic");

  if (error) {
    console.error("Error fetching dynamic QR count:", error);
    return 0;
  }

  return count || 0;
}

async function fetchUserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      settings: DEFAULT_SETTINGS,
      profile: null,
      dynamicQRCount: 0,
    };
  }

  const [settings, profile, dynamicQRCount] = await Promise.all([
    fetchUserSettings(user.id),
    fetchUserProfile(user.id),
    fetchUserDynamicQRCount(user.id),
  ]);

  return {
    user,
    settings,
    profile,
    dynamicQRCount,
  };
}

export default async function Create() {
  const { user, settings, profile, dynamicQRCount } = await fetchUserData();

  // Default quota for free users
  const defaultQuota = 3;
  const quotaInfo = {
    currentCount: dynamicQRCount,
    maxQuota: profile?.dynamic_qr_quota || defaultQuota,
    subscriptionLevel: profile?.subscription_level || "free",
    subscriptionStatus: profile?.subscription_status || "inactive",
  };

  return (
    <section className={`flex flex-col overflow-y-auto`}>
      <h1 className={`mb-4 text-xl font-bold`}>Create</h1>
      <QRCreator
        withHeading={false}
        user={user}
        userSettings={settings}
        quotaInfo={quotaInfo}
      />
    </section>
  );
}
