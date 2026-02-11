import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getPaddleInstance } from "@/utils/paddle/get-paddle-instance";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level } = body;

    if (level === undefined || level === null) {
      return NextResponse.json({ error: "Level is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const levelInt = parseInt(level);

    // Handle Free plan (level 0) — cancel Paddle subscription first
    if (levelInt === 0) {
      // Cancel the active Paddle subscription if one exists
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("paddle_subscription_id")
        .eq("user_id", user.id)
        .single();

      if (existingSub?.paddle_subscription_id) {
        try {
          const paddle = getPaddleInstance();
          await paddle.subscriptions.cancel(existingSub.paddle_subscription_id, {
            effectiveFrom: "next_billing_period",
          });
        } catch (cancelError) {
          console.error("Error cancelling Paddle subscription:", cancelError);
          return NextResponse.json(
            { error: "Failed to cancel existing subscription" },
            { status: 500 },
          );
        }
      }

      // Paddle webhook will handle the profile downgrade when cancellation takes effect.
      // For immediate UI feedback, update profile now.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_level: 0,
          dynamic_qr_quota: 3,
          subscription_status: "canceled",
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

      await supabase.from("subscriptions").delete().eq("user_id", user.id);

      const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?success=true&plan=Free`;
      return NextResponse.json({ url: successUrl });
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
      console.error("No Paddle price ID for package:", packageData.name);
      return NextResponse.json(
        { error: "Plan configuration error" },
        { status: 500 },
      );
    }

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

    const responseText = await paddleResponse.text();

    if (!paddleResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }

      console.error("Paddle API error:", {
        status: paddleResponse.status,
        errorData,
      });

      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    let checkoutData;
    try {
      checkoutData = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Invalid response from Paddle API" },
        { status: 500 },
      );
    }

    const checkoutUrl = checkoutData.data?.checkout?.url;

    if (!checkoutUrl) {
      console.error("No checkout URL in Paddle response");
      return NextResponse.json(
        { error: "No checkout URL returned from Paddle" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
