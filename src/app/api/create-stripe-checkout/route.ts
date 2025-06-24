import { NextResponse } from "next/server";

import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-06-20",
    });

    // Get request data
    const { level, success_url, cancel_url } = await request.json();

    // Create Supabase client
    const supabase = await createClient();

    // Get user from Supabase auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // Get the profile for the user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch subscription pricing based on the level
    let priceId: string;
    let planName: string;
    let quotaAmount: number;

    switch (level) {
      case "1":
        priceId = process.env.STRIPE_EXPLORER_PRICE_ID || "";
        planName = "Explorer";
        quotaAmount = 10;
        break;
      case "2":
        priceId = process.env.STRIPE_CREATOR_PRICE_ID || "";
        planName = "Creator";
        quotaAmount = 50;
        break;
      case "3":
        priceId = process.env.STRIPE_CHAMPION_PRICE_ID || "";
        planName = "Champion";
        quotaAmount = 250;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid subscription level" },
          { status: 400 },
        );
    }

    // Create or retrieve customer
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Update the profile with the customer ID
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: success_url,
      cancel_url: cancel_url,
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_name: planName,
          subscription_level: level,
          quota_amount: quotaAmount.toString(),
        },
      },
    });

    // Return the URL to the client
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
