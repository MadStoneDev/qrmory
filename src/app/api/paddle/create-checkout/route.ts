// /api/paddle/create-checkout/route.ts - DEBUG VERSION
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    console.log("=== Checkout Debug Start ===");

    const body = await request.json();
    console.log("Request body:", body);

    const { level } = body;

    if (level === undefined || level === null) {
      console.log("ERROR: Level is missing from request");
      return NextResponse.json({ error: "Level is required" }, { status: 400 });
    }

    console.log("Processing checkout for level:", level);

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.log("Auth error:", userError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      console.log("No user found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("User ID:", user.id);
    console.log("User email:", user.email);

    const levelInt = parseInt(level);
    console.log("Parsed level:", levelInt);

    // Handle Free plan (level 0)
    if (levelInt === 0) {
      console.log("Processing free plan downgrade");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_level: 0,
          dynamic_qr_quota: 3,
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

      await supabase.from("subscriptions").delete().eq("user_id", user.id);

      const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?success=true&plan=Free`;
      console.log("Free plan success URL:", successUrl);

      return NextResponse.json({ url: successUrl });
    }

    // Get subscription package details
    console.log("Looking up subscription package for level:", levelInt);

    const { data: packageData, error: packageError } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("level", levelInt)
      .eq("is_active", true)
      .single();

    console.log("Package query result:", { packageData, packageError });

    if (packageError || !packageData) {
      console.error("Package not found:", packageError);
      return NextResponse.json(
        { error: "Subscription package not found" },
        { status: 404 },
      );
    }

    console.log("Found package:", {
      id: packageData.id,
      name: packageData.name,
      paddle_price_id: packageData.paddle_price_id,
      price_in_cents: packageData.price_in_cents,
    });

    if (!packageData.paddle_price_id) {
      console.error("No Paddle price ID for package:", packageData.name);
      return NextResponse.json(
        {
          error: `No Paddle price ID configured for plan: ${packageData.name}`,
        },
        { status: 500 },
      );
    }

    // Environment check
    console.log("Environment variables check:");
    console.log("- NODE_ENV:", process.env.NODE_ENV);
    console.log("- PADDLE_API_KEY exists:", !!process.env.PADDLE_API_KEY);
    console.log("- NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL);

    const isProd = process.env.NODE_ENV === "production";
    const paddleApiUrl = isProd
      ? "https://api.paddle.com/transactions"
      : "https://sandbox-api.paddle.com/transactions";

    console.log("Using Paddle API URL:", paddleApiUrl);

    // Get user's existing Paddle customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", user.id)
      .single();

    console.log("User profile:", { profile, profileError });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create checkout payload
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

    console.log("Checkout payload:", JSON.stringify(checkoutPayload, null, 2));

    // Make Paddle API call
    console.log("Making Paddle API request...");

    const paddleResponse = await fetch(paddleApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutPayload),
    });

    console.log("Paddle response status:", paddleResponse.status);
    console.log(
      "Paddle response headers:",
      Object.fromEntries(paddleResponse.headers),
    );

    const responseText = await paddleResponse.text();
    console.log("Paddle raw response:", responseText);

    if (!paddleResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }

      console.error("Paddle API error:", {
        status: paddleResponse.status,
        statusText: paddleResponse.statusText,
        errorData: errorData,
        priceId: packageData.paddle_price_id,
        planName: packageData.name,
        apiUrl: paddleApiUrl,
      });

      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: errorData,
          paddleStatus: paddleResponse.status,
          priceId: packageData.paddle_price_id,
          planName: packageData.name,
          apiUrl: paddleApiUrl,
        },
        { status: 500 },
      );
    }

    let checkoutData;
    try {
      checkoutData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Paddle response:", parseError);
      return NextResponse.json(
        { error: "Invalid response from Paddle API" },
        { status: 500 },
      );
    }

    console.log("Parsed Paddle response:", checkoutData);

    const checkoutUrl = checkoutData.data?.checkout?.url;

    if (!checkoutUrl) {
      console.error(
        "No checkout URL in response structure:",
        JSON.stringify(checkoutData, null, 2),
      );
      return NextResponse.json(
        {
          error: "No checkout URL returned from Paddle",
          response: checkoutData,
        },
        { status: 500 },
      );
    }

    console.log("Success! Checkout URL:", checkoutUrl);
    console.log("=== Checkout Debug End ===");

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Checkout error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
