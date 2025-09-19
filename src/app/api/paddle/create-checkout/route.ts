// /api/paddle/create-checkout/route.ts - FIXED VERSION
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    console.log("=== Paddle Checkout Debug Start ===");

    const { level } = await request.json();
    console.log("Requested level:", level);

    // Validate level parameter
    if (level === undefined || level === null) {
      console.log("ERROR: Level is missing");
      return NextResponse.json({ error: "Level is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("ERROR: User not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("User ID:", user.id);

    const levelInt = parseInt(level);

    // Handle Free plan (level 0) - no checkout needed
    if (levelInt === 0) {
      // ... keep existing free plan logic ...
    }

    // Get subscription package details
    const { data: packageData, error: packageError } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("level", levelInt)
      .eq("is_active", true)
      .single();

    if (packageError || !packageData) {
      console.error("Package query error:", packageError);
      console.log("Available packages query result:", packageData);
      return NextResponse.json(
        { error: "Subscription package not found" },
        { status: 404 },
      );
    }

    console.log("Package found:", {
      name: packageData.name,
      priceId: packageData.paddle_price_id,
      level: packageData.level,
    });

    // Validate Paddle price ID
    if (!packageData.paddle_price_id) {
      console.log("ERROR: No Paddle price ID configured");
      return NextResponse.json(
        {
          error: `No Paddle price ID configured for plan: ${packageData.name}`,
          planId: level,
          planName: packageData.name,
        },
        { status: 500 },
      );
    }

    // FIXED: Check environment and set correct API URL
    const isProd = process.env.NODE_ENV === "production";
    const paddleApiUrl = isProd
      ? "https://api.paddle.com/transactions"
      : "https://sandbox-api.paddle.com/transactions";

    console.log("Using Paddle API URL:", paddleApiUrl);
    console.log("Environment:", isProd ? "production" : "sandbox");

    // Get user profile for customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", user.id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // FIXED: Correct Paddle API payload structure
    const checkoutPayload = {
      items: [
        {
          price_id: packageData.paddle_price_id,
          quantity: 1,
        },
      ],
      // FIXED: Use correct field names for Paddle API
      customer: profile?.paddle_customer_id
        ? {
            id: profile.paddle_customer_id,
          }
        : {
            email: user.email,
          },
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

    console.log("Paddle payload:", JSON.stringify(checkoutPayload, null, 2));

    // Verify API key exists
    if (!process.env.PADDLE_API_KEY) {
      console.log("ERROR: PADDLE_API_KEY not found in environment");
      return NextResponse.json(
        { error: "Paddle API key not configured" },
        { status: 500 },
      );
    }

    console.log("Making request to Paddle API...");

    // FIXED: Make request to correct Paddle endpoint
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
      Object.fromEntries(paddleResponse.headers.entries()),
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

      console.error("Paddle API error details:", {
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

    // FIXED: Handle the actual response structure from your logs
    let checkoutUrl;
    if (checkoutData.data?.checkout?.url) {
      checkoutUrl = checkoutData.data.checkout.url;
      console.log("Found checkout URL:", checkoutUrl);
    } else if (checkoutData.data?.checkout_url) {
      checkoutUrl = checkoutData.data.checkout_url;
    } else if (checkoutData.checkout_url) {
      checkoutUrl = checkoutData.checkout_url;
    } else {
      console.error(
        "No checkout URL found in response structure:",
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

    console.log("Checkout URL:", checkoutUrl);
    console.log("=== Paddle Checkout Debug End ===");

    return NextResponse.json({
      url: checkoutUrl,
    });
  } catch (error: any) {
    console.error("Paddle checkout error:", error);
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
