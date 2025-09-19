// /api/paddle/create-checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const {
      level,
      package_id,
      type = "main",
      success_url,
      cancel_url,
    } = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user profile to check for existing paddle_customer_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", user.id)
      .single();

    // Get plan details
    let planDetails;

    if (type === "main") {
      if (!level) {
        return NextResponse.json(
          { error: "Level is required for main subscriptions" },
          { status: 400 },
        );
      }

      const levelInt = parseInt(level);

      // Handle Free plan (level 0) - no checkout needed
      if (levelInt === 0) {
        // Update user to free plan directly
        await supabase
          .from("profiles")
          .update({
            subscription_level: 0,
            dynamic_qr_quota: 3, // Free tier quota
            subscription_status: "active",
          })
          .eq("id", user.id);

        // Cancel any existing subscriptions
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("user_id", user.id)
          .eq("subscription_type", "main");

        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        return NextResponse.json({
          url:
            success_url ||
            `${baseUrl}/subscription?success=true&downgrade=free`,
        });
      }

      const { data, error } = await supabase
        .from("subscription_packages")
        .select("*")
        .eq("level", levelInt)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching subscription package:", error);
        return NextResponse.json(
          { error: "Subscription package not found" },
          { status: 404 },
        );
      }

      planDetails = data;
    } else {
      if (!package_id) {
        return NextResponse.json(
          { error: "Package ID is required for booster subscriptions" },
          { status: 400 },
        );
      }

      const { data, error } = await supabase
        .from("quota_packages")
        .select("*")
        .eq("id", package_id)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching quota package:", error);
        return NextResponse.json(
          { error: "Quota package not found" },
          { status: 404 },
        );
      }

      planDetails = data;
    }

    // Check for valid price ID
    if (!planDetails.paddle_price_id) {
      return NextResponse.json(
        {
          error: `No Paddle price ID configured for this ${type} plan: ${planDetails.name}`,
          planId: type === "main" ? level : package_id,
          planName: planDetails.name,
        },
        { status: 500 },
      );
    }

    // Validate price ID format
    if (!planDetails.paddle_price_id.startsWith("pri_")) {
      return NextResponse.json(
        {
          error: `Invalid Paddle price ID format for ${planDetails.name}: ${planDetails.paddle_price_id}`,
          planId: type === "main" ? level : package_id,
        },
        { status: 500 },
      );
    }

    console.log(
      `Creating checkout for ${planDetails.name} (${type}) with price ID: ${planDetails.paddle_price_id}`,
    );

    // Create Paddle Billing v2 checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const checkoutPayload: any = {
      items: [
        {
          price_id: planDetails.paddle_price_id,
          quantity: 1,
        },
      ],
      custom_data: {
        user_id: user.id,
        plan_id: type === "main" ? level : package_id,
        type: type,
        user_email: user.email || "",
        plan_name: planDetails.name,
      },
      return_url: success_url || `${baseUrl}/subscription?success=true`,
    };

    // Only include customer_id if we have a valid Paddle customer ID
    if (profile?.paddle_customer_id) {
      checkoutPayload.customer_id = profile.paddle_customer_id;
      console.log(
        `Using existing Paddle customer ID: ${profile.paddle_customer_id}`,
      );
    } else {
      console.log(
        "No Paddle customer ID found - Paddle will create a new customer",
      );
    }

    console.log(
      "Paddle checkout payload:",
      JSON.stringify(checkoutPayload, null, 2),
    );

    // Make request to Paddle API
    const paddleResponse = await fetch(
      "https://api.paddle.com/checkout-sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutPayload),
      },
    );

    if (!paddleResponse.ok) {
      const errorData = await paddleResponse.json();
      console.error("Paddle API error:", {
        status: paddleResponse.status,
        statusText: paddleResponse.statusText,
        errorData: errorData,
        priceId: planDetails.paddle_price_id,
        planName: planDetails.name,
      });

      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: errorData,
          paddleStatus: paddleResponse.status,
          paddleStatusText: paddleResponse.statusText,
          priceId: planDetails.paddle_price_id,
          planName: planDetails.name,
        },
        { status: 500 },
      );
    }

    const checkoutData = await paddleResponse.json();
    console.log("Paddle checkout success:", {
      url: checkoutData.data?.checkout?.url,
      checkoutId: checkoutData.data?.checkout?.id,
      planName: planDetails.name,
    });

    // Return the checkout URL
    return NextResponse.json({
      url: checkoutData.data.checkout.url,
    });
  } catch (error: any) {
    console.error("Paddle checkout error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
