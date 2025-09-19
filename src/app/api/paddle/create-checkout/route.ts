// /api/paddle/create-checkout/route.ts - Simplified without quota packages
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { level } = await request.json();

    // Validate level parameter
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
      try {
        // Update user to free plan directly
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            subscription_level: 0,
            dynamic_qr_quota: 3, // Free tier quota
            subscription_status: "active",
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating profile to free:", profileError);
          return NextResponse.json(
            { error: "Failed to downgrade to free plan" },
            { status: 500 },
          );
        }

        // Cancel any existing subscriptions
        const { error: subscriptionError } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (subscriptionError) {
          console.error(
            "Error canceling existing subscriptions:",
            subscriptionError,
          );
          // Don't fail the request, just log the error
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        return NextResponse.json({
          url: `${baseUrl}/subscription?success=true&plan=free`,
        });
      } catch (error) {
        console.error("Error handling free plan:", error);
        return NextResponse.json(
          { error: "Failed to process free plan" },
          { status: 500 },
        );
      }
    }

    // Get subscription package details
    const { data: packageData, error: packageError } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("level", levelInt)
      .eq("is_active", true)
      .single();

    if (packageError || !packageData) {
      console.error("Error fetching subscription package:", packageError);
      return NextResponse.json(
        { error: "Subscription package not found" },
        { status: 404 },
      );
    }

    // Validate Paddle price ID
    if (!packageData.paddle_price_id) {
      return NextResponse.json(
        {
          error: `No Paddle price ID configured for plan: ${packageData.name}`,
          planId: level,
          planName: packageData.name,
        },
        { status: 500 },
      );
    }

    if (!packageData.paddle_price_id.startsWith("pri_")) {
      return NextResponse.json(
        {
          error: `Invalid Paddle price ID format for ${packageData.name}: ${packageData.paddle_price_id}`,
          planId: level,
        },
        { status: 500 },
      );
    }

    console.log(
      `Creating checkout for ${packageData.name} (level ${levelInt}) with price ID: ${packageData.paddle_price_id}`,
    );

    // Get user profile for customer ID (optional)
    const { data: profile } = await supabase
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", user.id)
      .single();

    // Create Paddle checkout payload
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const checkoutPayload: any = {
      items: [
        {
          price_id: packageData.paddle_price_id,
          quantity: 1,
        },
      ],
      custom_data: {
        user_id: user.id,
        level: levelInt.toString(),
        user_email: user.email || "",
        plan_name: packageData.name,
      },
      customer_data: {
        email: user.email,
      },
      success_url: `${baseUrl}/subscription?success=true&plan=${encodeURIComponent(
        packageData.name,
      )}`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
    };

    // Include existing customer ID if available
    if (profile?.paddle_customer_id) {
      checkoutPayload.customer_id = profile.paddle_customer_id;
      console.log(
        `Using existing Paddle customer ID: ${profile.paddle_customer_id}`,
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
        priceId: packageData.paddle_price_id,
        planName: packageData.name,
      });

      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: errorData,
          paddleStatus: paddleResponse.status,
          priceId: packageData.paddle_price_id,
          planName: packageData.name,
        },
        { status: 500 },
      );
    }

    const checkoutData = await paddleResponse.json();
    console.log("Paddle checkout success:", {
      url: checkoutData.data?.checkout?.url,
      checkoutId: checkoutData.data?.checkout?.id,
      planName: packageData.name,
    });

    return NextResponse.json({
      url: checkoutData.data.checkout.url,
    });
  } catch (error: any) {
    console.error("Paddle checkout error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
