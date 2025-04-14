import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

// Helper function to verify Stripe webhook signature
const verifyStripeWebhook = async (request: Request) => {
  const body = await request.text();
  const signature = headers().get("stripe-signature") || "";

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
    return { event, error: null };
  } catch (error) {
    return { event: null, error };
  }
};

export async function POST(request: Request) {
  const { event, error } = await verifyStripeWebhook(request);

  if (error) {
    console.error("Error verifying webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const supabase = createClient();

  try {
    // Handle specific events
    switch (event.type) {
      // Handle checkout session completion
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          // Handle subscription checkout
          await handleSubscriptionCheckout(supabase, session);
        } else if (session.mode === "payment") {
          // Handle one-time payment (quota package)
          await handleQuotaPurchase(supabase, session);
        }
        break;
      }

      // Handle subscription updates
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      // Handle subscription deletions/cancellations
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(supabase, subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handler for subscription checkout completion
async function handleSubscriptionCheckout(
  supabase,
  session: Stripe.Checkout.Session,
) {
  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );

  // Get metadata from the subscription
  const userId = subscription.metadata.user_id;
  const planName = subscription.metadata.plan_name;
  const subscriptionLevel = subscription.metadata.subscription_level;
  const quotaAmount = parseInt(subscription.metadata.quota_amount);

  if (!userId) {
    throw new Error("User ID not found in subscription metadata");
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0].price.id;

  // Get the current period end
  const currentPeriodEnd = new Date(
    subscription.current_period_end * 1000,
  ).toISOString();

  // Call database function to handle new subscription
  const { error } = await supabase.rpc("handle_new_subscription", {
    p_user_id: userId,
    p_subscription_id: subscription.id,
    p_price_id: priceId,
    p_status: subscription.status,
    p_plan_name: planName,
    p_current_period_end: currentPeriodEnd,
    p_quota_amount: quotaAmount,
  });

  if (error) {
    throw error;
  }
}

// Handler for quota package purchase
async function handleQuotaPurchase(supabase, session: Stripe.Checkout.Session) {
  // Get payment intent data
  const paymentIntentId = session.payment_intent as string;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // Get metadata from the payment intent
  const userId = paymentIntent.metadata.user_id;
  const packageId = paymentIntent.metadata.package_id;
  const quantity = parseInt(paymentIntent.metadata.quantity);
  const priceCents = parseInt(paymentIntent.metadata.price_in_cents);

  if (!userId || !packageId) {
    throw new Error("Missing required metadata for quota purchase");
  }

  // Call database function to handle quota purchase
  const { error } = await supabase.rpc("handle_quota_purchase", {
    p_user_id: userId,
    p_package_id: packageId,
    p_quantity: quantity,
    p_amount_paid: priceCents,
    p_stripe_checkout_id: session.id,
  });

  if (error) {
    throw error;
  }
}

// Handler for subscription updates
async function handleSubscriptionUpdate(
  supabase,
  subscription: Stripe.Subscription,
) {
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0].price.id;

  // Get the current period end
  const currentPeriodEnd = new Date(
    subscription.current_period_end * 1000,
  ).toISOString();

  // Get plan name from metadata
  const planName = subscription.metadata.plan_name;

  // Call database function to handle subscription updates
  const { error } = await supabase.rpc("handle_subscription_updated", {
    p_subscription_id: subscription.id,
    p_price_id: priceId,
    p_status: subscription.status,
    p_plan_name: planName,
    p_current_period_end: currentPeriodEnd,
  });

  if (error) {
    throw error;
  }
}

// Handler for subscription cancellations
async function handleSubscriptionCancellation(
  supabase,
  subscription: Stripe.Subscription,
) {
  // Update subscription status to cancelled
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    throw error;
  }

  // Get user ID from subscription in database
  const { data: subData, error: subError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (subError) {
    throw subError;
  }

  // Downgrade user subscription level to free (0)
  await supabase
    .from("profiles")
    .update({
      subscription_level: "0",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subData.user_id);
}
