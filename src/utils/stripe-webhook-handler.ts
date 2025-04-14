import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

// Handler for subscription checkout completion
export async function handleSubscriptionCheckout(
  supabase: any,
  subscription: Stripe.Subscription,
) {
  // Get metadata from the subscription
  const userId = subscription.metadata.user_id;
  const planName = subscription.metadata.plan_name;
  const subscriptionLevel = subscription.metadata.subscription_level;
  const quotaAmount = parseInt(subscription.metadata.quota_amount || "0");

  if (!userId) {
    throw new Error("User ID not found in subscription metadata");
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0].price.id;

  // Get the current period end
  const currentPeriodEnd = new Date(
    subscription.current_period_end * 1000,
  ).toISOString();

  // First, create or update the subscription record
  const { error: subscriptionError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: subscription.status,
        plan_name: planName,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );

  if (subscriptionError) {
    throw subscriptionError;
  }

  // Then, update the user's subscription level
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      subscription_level: subscriptionLevel,
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }
}

// Handler for quota package purchase
export async function handleQuotaPurchase(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent,
  session: Stripe.Checkout.Session,
) {
  // Get metadata from the payment intent
  const userId = paymentIntent.metadata.user_id;
  const packageId = paymentIntent.metadata.package_id;
  const quantity = parseInt(paymentIntent.metadata.quantity || "0");
  const priceCents = parseInt(paymentIntent.metadata.price_in_cents || "0");

  if (!userId || !packageId) {
    throw new Error("Missing required metadata for quota purchase");
  }

  // First, create the quota purchase record
  const { error: purchaseError } = await supabase
    .from("quota_purchases")
    .insert({
      user_id: userId,
      package_id: packageId,
      quantity: quantity,
      stripe_checkout_id: session.id,
      purchased_at: new Date().toISOString(),
    });

  if (purchaseError) {
    throw purchaseError;
  }

  // Then, increase the user's dynamic QR quota
  const { error: profileError } = await supabase
    .from("profiles")
    .select("dynamic_qr_quota")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw profileError;
  }

  // Get current quota
  const { data: profile } = await supabase
    .from("profiles")
    .select("dynamic_qr_quota")
    .eq("id", userId)
    .single();

  const currentQuota = profile?.dynamic_qr_quota || 0;

  // Update the quota
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      dynamic_qr_quota: currentQuota + quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    throw updateError;
  }
}

// Handler for subscription updates
export async function handleSubscriptionUpdate(
  supabase: any,
  subscription: Stripe.Subscription,
) {
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0].price.id;

  // Get the current period end
  const currentPeriodEnd = new Date(
    subscription.current_period_end * 1000,
  ).toISOString();

  // Get subscription level from metadata or determine from price ID
  let subscriptionLevel = subscription.metadata.subscription_level;
  const planName = subscription.metadata.plan_name;

  // Update the subscription record
  const { error: subscriptionError } = await supabase
    .from("subscriptions")
    .update({
      stripe_price_id: priceId,
      status: subscription.status,
      plan_name: planName,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (subscriptionError) {
    throw subscriptionError;
  }

  // Get the user ID from the subscription
  const { data: subData, error: subError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (subError) {
    throw subError;
  }

  // If the subscription is active, update the user's subscription level
  if (subscription.status === "active") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_level: subscriptionLevel,
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subData.user_id);

    if (profileError) {
      throw profileError;
    }
  } else if (
    subscription.status === "canceled" ||
    subscription.status === "unpaid"
  ) {
    // If the subscription is canceled or unpaid, downgrade the user
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_level: "0",
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subData.user_id);

    if (profileError) {
      throw profileError;
    }
  }
}

// Handler for subscription cancellations
export async function handleSubscriptionCancellation(
  supabase: any,
  subscription: Stripe.Subscription,
) {
  // Update subscription status to cancelled
  const { error: subscriptionError } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (subscriptionError) {
    throw subscriptionError;
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
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      subscription_level: "0",
      subscription_status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subData.user_id);

  if (profileError) {
    throw profileError;
  }
}
