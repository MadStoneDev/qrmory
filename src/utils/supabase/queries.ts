import { cache } from "react";
import { User, SupabaseClient } from "@supabase/supabase-js";

export const getUser = cache(
  async (supabase: SupabaseClient): Promise<User | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },
);

export const getUserProfile = cache(async (supabase: SupabaseClient) => {
  const user: User | null = await getUser(supabase);

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return profile;
});

export const getUserSettings = cache(async (supabase: SupabaseClient) => {
  const user: User | null = await getUser(supabase);

  if (!user) return null;

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) return null;

  return settings;
});

export const getUserQRCodes = cache(async (supabase: SupabaseClient) => {
  const user = await getUser(supabase);

  if (!user) return null;

  const { data: qrCodes, error } = await supabase
    .from("qr_codes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return null;

  return qrCodes;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const user = await getUser(supabase);

  if (!user) return null;

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  return subscription;
});

export const getTotalQuota = cache(async (supabase: SupabaseClient) => {
  const user: User | null = await getUser(supabase);

  if (!user) return 0;

  const { data: quota, error } = await supabase
    .from("user_settings")
    .select("dynamic_qr_quota")
    .eq("user_id", user.id)
    .single();

  if (!quota || error) return 0;

  return quota.dynamic_qr_quota ?? 0;
});

export const getUsedQuota = cache(async (supabase: SupabaseClient) => {
  const user: User | null = await getUser(supabase);

  if (!user) return 0;

  const { count } = await supabase
    .from("qr_codes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", "dynamic");

  return count ?? 0;
});

export const getLeftoverQuota = cache(async (supabase: SupabaseClient) => {
  const totalQuota = await getTotalQuota(supabase);
  const usedQuota = await getUsedQuota(supabase);

  return Math.max(0, totalQuota - usedQuota);
});

export const getSubscriptionPackages = cache(
  async (supabase: SupabaseClient) => {
    const { data: packages, error } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("level", { ascending: true });

    if (error) return [];

    return packages;
  },
);

export const ensurePaddleCustomer = cache(async (supabase: SupabaseClient) => {
  const user: User | null = await getUser(supabase);

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("paddle_customer_id")
    .eq("id", user.id)
    .single();

  if (error) return null;

  if (profile?.paddle_customer_id) return profile.paddle_customer_id;

  const userEmail = user.email;
  if (!userEmail) return null;

  try {
    const paddleResponse = await fetch("https://api.paddle.com/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    });

    if (!paddleResponse.ok) return null;

    const paddleCustomerId = (await paddleResponse.json()).data?.id;

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        paddle_customer_id: paddleCustomerId,
      })
      .eq("id", user.id)
      .select("paddle_customer_id")
      .single();

    if (updateError) return null;

    return updatedProfile.paddle_customer_id;
  } catch (error) {
    console.error("Error creating Paddle customer:", error);
    return null;
  }
});

export const ensureUserProfile = cache(async (supabase: SupabaseClient) => {
  const user: User | null = await getUser(supabase);

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        subscription_level: 0,
        dynamic_qr_quota: 3,
        subscription_status: "inactive",
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (createError || !newProfile) {
      console.error("Error creating user profile:", createError);
      return null;
    }

    return newProfile;
  }

  return profile;
});

export const getUserAnalytics = cache(async (supabase: SupabaseClient) => {
  const qrCodes = await getUserQRCodes(supabase);

  if (!qrCodes?.length) {
    return {
      qrCodes: [],
      analytics: null,
    };
  }

  const qrCodeIds = qrCodes.map((qr) => qr.id);
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Get analytics data
  const [
    { count: totalScans },
    { data: recentScans },
    { data: countryStats },
    { data: deviceStats },
    { data: browserStats },
    { data: dailyScans },
  ] = await Promise.all([
    // Total scans
    supabase
      .from("qr_code_analytics")
      .select("*", { count: "exact", head: true })
      .in("qr_code_id", qrCodeIds),

    // Recent scans (last 30 days)
    supabase
      .from("qr_code_analytics")
      .select("*")
      .in("qr_code_id", qrCodeIds)
      .gte("scanned_at", thirtyDaysAgo)
      .order("scanned_at", { ascending: false })
      .limit(100),

    // Country breakdown
    supabase
      .from("qr_code_analytics")
      .select("country")
      .in("qr_code_id", qrCodeIds)
      .gte("scanned_at", thirtyDaysAgo),

    // Device type breakdown
    supabase
      .from("qr_code_analytics")
      .select("device_type")
      .in("qr_code_id", qrCodeIds)
      .gte("scanned_at", thirtyDaysAgo),

    // Browser breakdown
    supabase
      .from("qr_code_analytics")
      .select("browser")
      .in("qr_code_id", qrCodeIds)
      .gte("scanned_at", thirtyDaysAgo),

    // Daily scans for last 7 days
    supabase
      .from("qr_code_analytics")
      .select("scanned_at")
      .in("qr_code_id", qrCodeIds)
      .gte("scanned_at", sevenDaysAgo)
      .order("scanned_at", { ascending: true }),
  ]);

  // Process the data
  const countryBreakdown =
    countryStats?.reduce((acc: any, scan: any) => {
      acc[scan.country] = (acc[scan.country] || 0) + 1;
      return acc;
    }, {}) || {};

  const deviceBreakdown =
    deviceStats?.reduce((acc: any, scan: any) => {
      acc[scan.device_type] = (acc[scan.device_type] || 0) + 1;
      return acc;
    }, {}) || {};

  const browserBreakdown =
    browserStats?.reduce((acc: any, scan: any) => {
      const browser = scan.browser || "Unknown";
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {}) || {};

  // Daily scans for chart
  const dailyBreakdown =
    dailyScans?.reduce((acc: any, scan: any) => {
      const date = new Date(scan.scanned_at).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

  return {
    qrCodes,
    analytics: {
      totalScans: totalScans || 0,
      recentScans: recentScans || [],
      countryBreakdown,
      deviceBreakdown,
      browserBreakdown,
      dailyBreakdown,
    },
  };
});
