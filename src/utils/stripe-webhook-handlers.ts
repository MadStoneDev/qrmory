// /lib/stripe-webhook-handlers.ts - Fixed TypeScript errors
import Stripe from "stripe";
import { SUBSCRIPTION_LEVELS, DEFAULT_QUOTAS } from "@/lib/subscription-config";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

// Types for better type safety
interface SubscriptionMetadata {
  user_id?: string;
  package_id?: string;
  plan_name?: string;
  subscription_level?: string;
  quota_amount?: string;
  type?: string; // Added type field for booster detection
}

interface QuotaMetadata {
  user_id?: string;
  package_id?: string;
  package_name?: string;
  quantity?: string;
  price_in_cents?: string;
}

// Type for booster subscription queries
interface BoosterSubscriptionResult {
  stripe_price_id: string;
  quota_packages: {
    quantity: number;
  } | null;
}

// Validation helpers
function validateRequired<T>(value: T | undefined, fieldName: string): T {
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required field: ${fieldName}`);
  }
  return value;
}

function parseIntSafe(
  value: string | undefined,
  fieldName: string,
  defaultValue?: number,
): number {
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required numeric field: ${fieldName}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}: ${value}`);
  }
  return parsed;
}

// Enhanced metadata extraction with fallbacks
async function extractSubscriptionMetadata(
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session,
): Promise<
  SubscriptionMetadata & {
    userId: string;
    subscriptionLevel: number;
    quotaAmount: number;
    isBooster: boolean; // Add isBooster to the return type
  }
> {
  let metadata: SubscriptionMetadata = {};

  // Try session metadata first, then subscription metadata
  if (session?.metadata) {
    metadata = session.metadata;
  } else if (subscription.metadata) {
    metadata = subscription.metadata;
  }

  // If no metadata found, try customer metadata
  if (Object.keys(metadata).length === 0 && subscription.customer) {
    try {
      const customer = await stripe.customers.retrieve(
        subscription.customer as string,
      );
      if (customer && !customer.deleted && customer.metadata) {
        metadata = customer.metadata;
      }
    } catch (error) {
      console.warn("Could not retrieve customer metadata:", error);
    }
  }

  console.log("🏷️ Extracted metadata:", metadata);

  // Extract and validate required fields
  let userId = metadata.user_id;
  let subscriptionLevel = metadata.subscription_level;
  let quotaAmount = metadata.quota_amount;

  // Determine if this is a booster subscription
  const isBooster = metadata.type === "booster";

  // If missing user_id, try to find by customer ID (your existing logic)
  if (!userId && subscription.customer) {
    // This requires supabase instance - will be handled in the calling function
    throw new Error("USER_ID_LOOKUP_REQUIRED");
  }

  // If missing package info, look up by price ID
  if (!metadata.package_id && subscription.items.data.length > 0) {
    throw new Error("PACKAGE_LOOKUP_REQUIRED");
  }

  return {
    ...metadata,
    userId: validateRequired(userId, "user_id"),
    subscriptionLevel: parseIntSafe(subscriptionLevel, "subscription_level"),
    quotaAmount: parseIntSafe(quotaAmount, "quota_amount"),
    isBooster, // Now properly included in return type
  };
}

// Handler for subscription checkout completion
export async function handleSubscriptionCheckout(
  supabase: any,
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session,
) {
  console.log("🎯 Processing subscription checkout for:", subscription.id);

  try {
    const metadata = await extractSubscriptionMetadata(subscription, session);

    // Handle metadata lookup requirements
    let { userId, subscriptionLevel, quotaAmount, isBooster } = metadata;

    // Lookup user by customer ID if needed
    if (!userId && subscription.customer) {
      console.log("🔍 Looking up user by customer ID:", subscription.customer);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", subscription.customer)
        .single();

      if (error || !profile) {
        throw new Error(
          `User not found for customer ID: ${subscription.customer}`,
        );
      }
      userId = profile.id;
    }

    // Lookup package info by price ID if needed
    if (!metadata.package_id && subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      console.log("🔍 Looking up package by price ID:", priceId);

      if (isBooster) {
        // Look up in quota_packages for boosters
        const { data: boosterPackage, error } = await supabase
          .from("quota_packages")
          .select("*")
          .eq("stripe_price_id", priceId)
          .single();

        if (error || !boosterPackage) {
          throw new Error(`Booster package not found for price ID: ${priceId}`);
        }

        subscriptionLevel = -1; // Special level for boosters
        quotaAmount = boosterPackage.quantity;
      } else {
        // Look up in subscription_packages for main subscriptions
        const { data: subPackage, error } = await supabase
          .from("subscription_packages")
          .select("*")
          .eq("stripe_price_id", priceId)
          .single();

        if (error || !subPackage) {
          throw new Error(
            `Subscription package not found for price ID: ${priceId}`,
          );
        }

        subscriptionLevel = subPackage.level;
        quotaAmount = subPackage.quota_amount;
      }
    }

    console.log("🎯 Processing with validated data:", {
      userId,
      subscriptionLevel,
      quotaAmount,
      isBooster,
      subscriptionId: subscription.id,
    });

    // Get the price ID and period end
    const priceId = subscription.items.data[0]?.price.id;
    const currentPeriodEnd = new Date(
      subscription.current_period_end * 1000,
    ).toISOString();

    // Fix the type conversion issue for SUBSCRIPTION_LEVELS
    let planName = metadata.plan_name;
    if (!planName) {
      if (isBooster) {
        planName = "Booster";
      } else {
        // Ensure subscriptionLevel is a valid key type
        const levelKey =
          subscriptionLevel.toString() as keyof typeof SUBSCRIPTION_LEVELS;
        planName = SUBSCRIPTION_LEVELS[levelKey] || "Unknown";
      }
    }

    // Create or update subscription record using upsert
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          status: subscription.status,
          plan_name: planName,
          subscription_type: isBooster ? "booster" : "main",
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "stripe_subscription_id",
          ignoreDuplicates: false,
        },
      );

    if (subscriptionError) {
      throw new Error(
        `Failed to upsert subscription: ${subscriptionError.message}`,
      );
    }

    if (isBooster) {
      // For booster subscriptions, add to extra_quota_from_boosters
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("extra_quota_from_boosters")
        .eq("id", userId)
        .single();

      if (profileError) {
        throw new Error(`Failed to get user profile: ${profileError.message}`);
      }

      const currentBoosterQuota = profile?.extra_quota_from_boosters || 0;
      const newBoosterQuota = currentBoosterQuota + quotaAmount;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          extra_quota_from_boosters: newBoosterQuota,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        throw new Error(
          `Failed to update booster quota: ${updateError.message}`,
        );
      }

      console.log(
        `✅ Booster subscription processed: +${quotaAmount} boosters (total: ${newBoosterQuota})`,
      );
    } else {
      // For main subscriptions, update subscription level and quota
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_level: subscriptionLevel,
          dynamic_qr_quota: quotaAmount,
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      console.log("✅ Main subscription checkout processed successfully");
    }
  } catch (error) {
    console.error("❌ Subscription checkout processing failed:", error);
    throw error;
  }
}

// Handler for quota/booster purchase
export async function handleQuotaPurchase(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent,
  session: Stripe.Checkout.Session,
) {
  console.log("🚀 Processing quota purchase for session:", session.id);

  try {
    // Extract metadata from payment intent
    const metadata: QuotaMetadata = paymentIntent.metadata || {};

    const userId = validateRequired(metadata.user_id, "user_id");
    const packageId = validateRequired(metadata.package_id, "package_id");
    const quantity = parseIntSafe(metadata.quantity, "quantity");
    const priceCents = parseIntSafe(metadata.price_in_cents, "price_in_cents");

    console.log("🎯 Processing quota purchase with:", {
      userId,
      packageId,
      quantity,
      priceCents,
    });

    // Record the quota purchase
    const { error: purchaseError } = await supabase
      .from("quota_purchases")
      .insert({
        user_id: userId,
        package_id: packageId,
        quantity: quantity,
        stripe_checkout_id: session.id,
        amount_paid_cents: priceCents,
        purchased_at: new Date().toISOString(),
      });

    if (purchaseError) {
      throw new Error(
        `Failed to record quota purchase: ${purchaseError.message}`,
      );
    }

    // Get current user quota
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("extra_quota_from_boosters")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw new Error(`Failed to get user profile: ${profileError.message}`);
    }

    const currentBoosterQuota = profile?.extra_quota_from_boosters || 0;
    const newBoosterQuota = currentBoosterQuota + quantity;

    // Update user's booster quota
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        extra_quota_from_boosters: newBoosterQuota,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      throw new Error(`Failed to update user quota: ${updateError.message}`);
    }

    console.log(
      `✅ Quota purchase processed: +${quantity} boosters (total: ${newBoosterQuota})`,
    );
  } catch (error) {
    console.error("❌ Quota purchase processing failed:", error);
    throw error;
  }
}

// Handler for subscription updates
export async function handleSubscriptionUpdate(
  supabase: any,
  subscription: Stripe.Subscription,
) {
  console.log("🔄 Processing subscription update for:", subscription.id);

  try {
    const priceId = subscription.items.data[0]?.price.id;
    const currentPeriodEnd = new Date(
      subscription.current_period_end * 1000,
    ).toISOString();

    // Determine if this is a booster or main subscription
    let isBooster = false;
    let subscriptionLevel: number | undefined;
    let quotaAmount: number | undefined;
    let planName = subscription.metadata.plan_name;

    if (priceId) {
      // First try to find in subscription_packages (main subscriptions)
      const { data: subPackage } = await supabase
        .from("subscription_packages")
        .select("level, quota_amount, name")
        .eq("stripe_price_id", priceId)
        .single();

      if (subPackage) {
        subscriptionLevel = subPackage.level;
        quotaAmount = subPackage.quota_amount;
        planName = subPackage.name;
        isBooster = false;
      } else {
        // If not found, try quota_packages (booster subscriptions)
        const { data: boosterPackage } = await supabase
          .from("quota_packages")
          .select("quantity as quota_amount, name")
          .eq("stripe_price_id", priceId)
          .single();

        if (boosterPackage) {
          subscriptionLevel = -1; // Special level for boosters
          quotaAmount = boosterPackage.quota_amount;
          planName = boosterPackage.name;
          isBooster = true;
        }
      }
    }

    // Update subscription record
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .update({
        stripe_price_id: priceId,
        status: subscription.status,
        plan_name: planName,
        subscription_type: isBooster ? "booster" : "main",
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (subscriptionError) {
      throw new Error(
        `Failed to update subscription: ${subscriptionError.message}`,
      );
    }

    // Get user ID from subscription record
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id, subscription_type")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (subError || !subData) {
      throw new Error(`Subscription record not found: ${subscription.id}`);
    }

    // Update user profile based on subscription status and type
    if (
      subscription.status === "active" &&
      subscriptionLevel !== undefined &&
      quotaAmount !== undefined
    ) {
      if (isBooster) {
        // For booster subscriptions, we need to recalculate total booster quota
        // This is complex because we need to sum all active booster subscriptions
        const { data: activeBoosterSubs, error: boosterSubsError } =
          await supabase
            .from("subscriptions")
            .select(
              `
            stripe_price_id,
            quota_packages!inner(quantity)
          `,
            )
            .eq("user_id", subData.user_id)
            .eq("status", "active")
            .eq("subscription_type", "booster");

        if (boosterSubsError) {
          console.warn(
            "Error fetching booster subscriptions:",
            boosterSubsError,
          );
        }

        let totalBoosterQuota = 0;
        if (activeBoosterSubs) {
          totalBoosterQuota = (
            activeBoosterSubs as BoosterSubscriptionResult[]
          ).reduce((total: number, sub: BoosterSubscriptionResult) => {
            return total + (sub.quota_packages?.quantity || 0);
          }, 0);
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            extra_quota_from_boosters: totalBoosterQuota,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subData.user_id);

        if (profileError) {
          throw new Error(
            `Failed to update booster profile: ${profileError.message}`,
          );
        }

        console.log(
          `✅ Booster subscription updated: total booster quota now ${totalBoosterQuota}`,
        );
      } else {
        // For main subscriptions, update subscription level and quota
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            subscription_level: subscriptionLevel,
            dynamic_qr_quota: quotaAmount,
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subData.user_id);

        if (profileError) {
          throw new Error(
            `Failed to update main profile: ${profileError.message}`,
          );
        }

        console.log("✅ Main subscription updated successfully");
      }
    } else if (
      ["canceled", "unpaid", "past_due"].includes(subscription.status)
    ) {
      if (isBooster) {
        // For canceled booster, recalculate total booster quota
        const { data: activeBoosterSubs } = await supabase
          .from("subscriptions")
          .select(
            `
            stripe_price_id,
            quota_packages!inner(quantity)
          `,
          )
          .eq("user_id", subData.user_id)
          .eq("status", "active")
          .eq("subscription_type", "booster")
          .neq("stripe_subscription_id", subscription.id); // Exclude the canceled one

        let totalBoosterQuota = 0;
        if (activeBoosterSubs) {
          totalBoosterQuota = (
            activeBoosterSubs as BoosterSubscriptionResult[]
          ).reduce((total: number, sub: BoosterSubscriptionResult) => {
            return total + (sub.quota_packages?.quantity || 0);
          }, 0);
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            extra_quota_from_boosters: totalBoosterQuota,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subData.user_id);

        if (profileError) {
          throw new Error(
            `Failed to update booster profile: ${profileError.message}`,
          );
        }

        console.log(
          `✅ Booster subscription canceled: total booster quota now ${totalBoosterQuota}`,
        );
      } else {
        // For canceled main subscription, downgrade to free plan
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            subscription_level: 0,
            dynamic_qr_quota: DEFAULT_QUOTAS[0],
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subData.user_id);

        if (profileError) {
          throw new Error(
            `Failed to downgrade profile: ${profileError.message}`,
          );
        }

        console.log("✅ Main subscription canceled - user downgraded to free");
      }
    }

    console.log("✅ Subscription update processed successfully");
  } catch (error) {
    console.error("❌ Subscription update processing failed:", error);
    throw error;
  }
}

// Handler for subscription cancellation
export async function handleSubscriptionCancellation(
  supabase: any,
  subscription: Stripe.Subscription,
) {
  console.log("❌ Processing subscription cancellation for:", subscription.id);

  try {
    // Update subscription status
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (subscriptionError) {
      throw new Error(
        `Failed to update subscription status: ${subscriptionError.message}`,
      );
    }

    // Get user ID
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (subError || !subData) {
      throw new Error(`Subscription record not found: ${subscription.id}`);
    }

    // Downgrade user to free plan
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_level: 0,
        dynamic_qr_quota: DEFAULT_QUOTAS[0],
        subscription_status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subData.user_id);

    if (profileError) {
      throw new Error(
        `Failed to downgrade user profile: ${profileError.message}`,
      );
    }

    console.log("✅ Subscription cancellation processed successfully");
  } catch (error) {
    console.error("❌ Subscription cancellation processing failed:", error);
    throw error;
  }
}

// Handler for invoice payment succeeded
export async function handleInvoicePaymentSucceeded(
  supabase: any,
  invoice: Stripe.Invoice,
) {
  console.log("💳✅ Processing invoice payment succeeded for:", invoice.id);

  try {
    // This is mainly for recurring subscription payments
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string,
      );

      // Ensure subscription status is active and user profile is up to date
      await handleSubscriptionUpdate(supabase, subscription);
    }

    // Log the successful payment
    await supabase
      .from("payment_events")
      .insert({
        stripe_invoice_id: invoice.id,
        event_type: "payment_succeeded",
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        processed_at: new Date().toISOString(),
      })
      .catch(console.error); // Don't fail if logging fails

    console.log("✅ Invoice payment succeeded processed successfully");
  } catch (error) {
    console.error("❌ Invoice payment succeeded processing failed:", error);
    throw error;
  }
}

// Handler for invoice payment failed
export async function handleInvoicePaymentFailed(
  supabase: any,
  invoice: Stripe.Invoice,
) {
  console.log("💳❌ Processing invoice payment failed for:", invoice.id);

  try {
    // Handle failed recurring payments
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string,
      );

      // Update subscription status - this will handle past_due status
      await handleSubscriptionUpdate(supabase, subscription);
    }

    // Log the failed payment
    await supabase
      .from("payment_events")
      .insert({
        stripe_invoice_id: invoice.id,
        event_type: "payment_failed",
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        failure_reason: invoice.last_finalization_error?.message || "Unknown",
        processed_at: new Date().toISOString(),
      })
      .catch(console.error); // Don't fail if logging fails

    console.log("✅ Invoice payment failed processed successfully");
  } catch (error) {
    console.error("❌ Invoice payment failed processing failed:", error);
    throw error;
  }
}
