// /api/create-stripe-checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting checkout session creation...");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-06-20",
    });

    const { level, success_url, cancel_url } = await request.json();
    console.log("📋 Request data:", { level, success_url, cancel_url });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    console.log("👤 User:", user.id, user.email);

    // Get subscription package
    const { data: subscriptionPackage, error: packageError } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("level", parseInt(level))
      .eq("is_active", true)
      .single();

    if (packageError || !subscriptionPackage) {
      console.log("❌ Package not found:", packageError);
      return NextResponse.json(
        { error: "Subscription package not found" },
        { status: 404 },
      );
    }

    console.log("📦 Package found:", subscriptionPackage);

    // Handle customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        console.log("✅ Customer verified:", customerId);
      } catch {
        console.log("❌ Customer not found, creating new one");
        customerId = null;
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      console.log("✅ New customer created:", customerId);

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3020";
    const finalSuccessUrl =
      success_url || `${baseUrl}/subscription?success=true`;
    const finalCancelUrl =
      cancel_url || `${baseUrl}/subscription?canceled=true`;

    // Create metadata object
    const metadata = {
      user_id: user.id,
      package_id: subscriptionPackage.id,
      plan_name: subscriptionPackage.name,
      subscription_level: level,
      quota_amount: subscriptionPackage.quota_amount.toString(),
    };

    console.log("🏷️ Metadata to include:", metadata);

    console.log("🛒 Creating checkout session...");

    // Create checkout session with metadata in BOTH places
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: subscriptionPackage.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,

      // Put metadata on the checkout session itself
      metadata: metadata,

      // Also put metadata on the subscription
      subscription_data: {
        metadata: metadata,
      },

      // Additional settings
      billing_address_collection: "auto",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
    });

    console.log("✅ Checkout session created:", session.id);
    console.log("🏷️ Session metadata:", session.metadata);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("💥 Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
