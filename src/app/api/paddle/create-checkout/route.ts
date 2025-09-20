// /api/paddle/create-checkout/route.ts - SIMPLIFIED VERSION
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { level } = await request.json();

    if (level === undefined || level === null) {
      return NextResponse.json({ error: "Level is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const levelInt = parseInt(level);

    // Handle Free plan (level 0) - no checkout needed
    if (levelInt === 0) {
      // Update user to free plan
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_level: 0,
          dynamic_qr_quota: 3, // Free plan quota
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Error updating profile to free:", profileError);
        return NextResponse.json(
          { error: "Failed to update profile" },
          { status: 500 },
        );
      }

      // Remove any existing subscription
      await supabase.from("subscriptions").delete().eq("user_id", user.id);

      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?success=true&plan=Free`,
      });
    }

    // Get subscription package details
    const { data: packageData, error: packageError } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("level", levelInt)
      .eq("is_active", true)
      .single();

    if (packageError || !packageData) {
      return NextResponse.json(
        { error: "Subscription package not found" },
        { status: 404 },
      );
    }

    if (!packageData.paddle_price_id) {
      return NextResponse.json(
        {
          error: `No Paddle price ID configured for plan: ${packageData.name}`,
        },
        { status: 500 },
      );
    }

    // Determine environment and API URL
    const isProd = process.env.NODE_ENV === "production";
    const paddleApiUrl = isProd
      ? "https://api.paddle.com/transactions"
      : "https://sandbox-api.paddle.com/transactions";

    // Get user's existing Paddle customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", user.id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create checkout session
    const checkoutPayload = {
      items: [
        {
          price_id: packageData.paddle_price_id,
          quantity: 1,
        },
      ],
      customer: profile?.paddle_customer_id
        ? { id: profile.paddle_customer_id }
        : { email: user.email },
      custom_data: {
        user_id: user.id,
        level: levelInt.toString(),
        user_email: user.email || "",
        plan_name: packageData.name,
      },
      checkout: {
        success_url: `${baseUrl}/dashboard/subscription?success=true&plan=${encodeURIComponent(
          packageData.name,
        )}`,
        cancel_url: `${baseUrl}/dashboard/subscription?canceled=true`,
      },
    };

    const paddleResponse = await fetch(paddleApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!paddleResponse.ok) {
      const errorData = await paddleResponse.json();
      console.error("Paddle API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    const checkoutData = await paddleResponse.json();
    const checkoutUrl = checkoutData.data?.checkout?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "No checkout URL returned from Paddle" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
