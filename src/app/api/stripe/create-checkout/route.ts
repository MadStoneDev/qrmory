import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/admin";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

import { Database } from "database.types";

const SUBSCRIPTION_LEVEL_MAP = {
  0: "free",
  1: "explorer",
  2: "creator",
  3: "champion",
} as const;

const SUBSCRIPTION_NAME_TO_LEVEL = {
  free: 0,
  explorer: 1,
  creator: 2,
  champion: 3,
} as const;

const SUBSCRIPTION_QUOTA_MAP = {
  free: 5,
  explorer: 10,
  creator: 50,
  champion: 250,
} as const;

const PRICE_TO_PLAN_MAP: Record<
  string,
  keyof typeof SUBSCRIPTION_NAME_TO_LEVEL
> = {
  price_1QxoD2BHZOxRIZs4fUaxu2JR: "explorer",
  price_1QxoDEBHZOxRIZs4jiCT7evM: "creator",
  price_1QxoDbBHZOxRIZs4Y42VCq1n: "champion",
};

type SubscriptionLevel = Database["public"]["Enums"]["subscription_level"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "No price id provided" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const userId = user.id;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 401 });
    }

    const planName = PRICE_TO_PLAN_MAP[priceId];
    if (!planName) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingSubscription && existingSubscription.status === "active") {
      const currentPlanLevel = parseInt(profile.subscription_level);
      const newPlanLevel = SUBSCRIPTION_NAME_TO_LEVEL[planName];

      if (newPlanLevel < currentPlanLevel) {
        return NextResponse.json(
          { error: "Please use your billing page to downgrade your plan" },
          { status: 400 },
        );
      }
    }

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || "",
        metadata: {
          supabaseUUID: userId,
        },
      });

      customerId = customer.id;

      await supabaseAdmin
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
        })
        .eq("id", userId);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env
        .NEXT_PUBLIC_SITE_URL!}/account/subscription?success=true`,
      cancel_url: `${process.env
        .NEXT_PUBLIC_SITE_URL!}/account/subscription?cancel=true`,
      metadata: {
        user_id: userId,
        planName,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error creating checkout session", error);
    return NextResponse.json(
      {
        error: error.message || "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
