// /api/create-quota-checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-06-20",
    });

    // Get request data
    const { package_id, success_url, cancel_url } = await request.json();

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

    // Get the quota package details
    const { data: quotaPackage, error: packageError } = await supabase
      .from("quota_packages")
      .select("*")
      .eq("id", package_id)
      .single();

    if (packageError || !quotaPackage) {
      return NextResponse.json(
        { error: "Quota package not found" },
        { status: 404 },
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

    // Create the checkout session for one-time purchase
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: quotaPackage.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          package_id: package_id,
          package_name: quotaPackage.name,
          quantity: quotaPackage.quantity.toString(),
          price_in_cents: quotaPackage.price_in_cents.toString(),
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
