import React from "react";

import HomeHero from "@/components/home-hero-section";
import HomeInfo from "@/components/home-info-section";

import QRCreator from "@/components/qr-create/qr-creator";

import MainNavigation from "@/components/main-navigation";
import MainFooter from "@/components/main-footer";

import { createClient } from "@/utils/supabase/server";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";

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

export default async function Home() {
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
    <>
      <main className="mb-8 flex min-h-screen flex-col items-center justify-between">
        <MainNavigation />

        <HomeHero />

        <QRCreator
          shadow={true}
          user={user}
          userSettings={settings}
          quotaInfo={quotaInfo}
        />

        <HomeInfo />

        <p className="mx-auto mt-5 pt-2 px-4 sm:px-8 max-w-4xl font-light text-sm leading-6 text-center opacity-80 hover:opacity-100 transition-all duration-300">
          Spotted a QR code that looks fishy? Not sure if it's one of ours? No
          worries! Drop us a line on our{" "}
          <a
            href="/contact"
            className={`px-1 py-0.5 hover:bg-qrmory-purple-800 text-qrmory-purple-300 hover:text-stone-100 transition-all duration-300`}
          >
            contact page
          </a>
          . We're always happy to chat! Oh, and while you're here, why not take
          a quick peek at our{" "}
          <a
            href="/terms-and-conditions"
            className={`px-1 py-0.5 hover:bg-qrmory-purple-800 text-qrmory-purple-300 hover:text-stone-100 transition-all duration-300`}
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy-policy"
            className={`px-1 py-0.5 hover:bg-qrmory-purple-800 text-qrmory-purple-300 hover:text-stone-100 transition-all duration-300`}
          >
            Privacy Policy
          </a>
          ? They're packed with juicy details on how to use QRmory safely and
          smartly. Trust us, it's riveting stuff! 😉
        </p>

        <section>{/* TODO Sprint#3: Add a FAQ Section */}</section>
      </main>

      <MainFooter />
    </>
  );
}
