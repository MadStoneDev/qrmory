// /api/paddle/create-checkout/route.ts - FOR PADDLE BILLING (v2)
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

    // Get plan details
    let planDetails;

    if (type === "main") {
      if (!level) {
        return NextResponse.json(
          { error: "Level is required for main subscriptions" },
          { status: 400 },
        );
      }

      const { data, error } = await supabase
        .from("subscription_packages")
        .select("*")
        .eq("level", parseInt(level))
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

    if (!planDetails.paddle_price_id) {
      return NextResponse.json(
        {
          error: `No Paddle price ID configured for this ${type} plan`,
          planId: type === "main" ? level : package_id,
        },
        { status: 500 },
      );
    }

    // Create Paddle Billing v2 checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const checkoutPayload = {
      items: [
        {
          price_id: planDetails.paddle_price_id,
          quantity: 1,
        },
      ],
      customer_id: user.id, // Or create customer first if needed
      custom_data: {
        user_id: user.id,
        plan_id: type === "main" ? level : package_id,
        type: type,
      },
      return_url: success_url || `${baseUrl}/subscription?success=true`,
      // Paddle v2 doesn't have a separate cancel_url, uses return_url
    };

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
      console.error("Paddle API error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: errorData,
        },
        { status: 500 },
      );
    }

    const checkoutData = await paddleResponse.json();

    // Return the checkout URL
    return NextResponse.json({
      url: checkoutData.data.checkout.url,
    });
  } catch (error: any) {
    console.error("Paddle checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
