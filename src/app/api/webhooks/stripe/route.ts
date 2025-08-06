// app/api/webhooks/stripe/route.ts - Enhanced security and consistency
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import crypto from "crypto";
import { Stripe } from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

// Enhanced webhook signature validation
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  try {
    // Stripe signature format: t=timestamp,v1=signature
    const elements = signature.split(",");
    const timestamp = elements.find((el) => el.startsWith("t="))?.split("=")[1];
    const sig = elements.find((el) => el.startsWith("v1="))?.split("=")[1];

    if (!timestamp || !sig) {
      throw new Error("Invalid signature format");
    }

    // Check timestamp (prevent replay attacks)
    const timestampNumber = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(currentTime - timestampNumber);

    // Reject webhooks older than 5 minutes
    if (timeDifference > 300) {
      throw new Error("Webhook timestamp too old");
    }

    // Verify signature
    const signedPayload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload, "utf8")
      .digest("hex");

    // Use constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );

    return isValid;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

// Database transaction wrapper with retry logic
async function executeWithTransaction<T>(
  supabase: any,
  operation: (client: any) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Start transaction
      const { data, error } = await supabase.rpc("begin_transaction");
      if (error) throw error;

      try {
        const result = await operation(supabase);

        // Commit transaction
        const { error: commitError } = await supabase.rpc("commit_transaction");
        if (commitError) throw commitError;

        return result;
      } catch (operationError) {
        // Rollback on operation failure
        await supabase.rpc("rollback_transaction").catch(console.error);
        throw operationError;
      }
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        const delay = 100 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.warn(
          `Transaction attempt ${attempt} failed, retrying in ${delay}ms:`,
          error,
        );
      }
    }
  }

  throw new Error(
    `Transaction failed after ${maxRetries} attempts: ${lastError?.message}`,
  );
}

// Enhanced subscription processing with atomic operations
async function processSubscriptionUpdate(
  supabase: any,
  subscription: Stripe.Subscription,
  eventType: string,
): Promise<void> {
  await executeWithTransaction(supabase, async (client) => {
    // Get user ID from subscription
    const { data: existingSubscription, error: subError } = await client
      .from("subscriptions")
      .select("user_id, subscription_type")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (subError) {
      throw new Error(`Subscription not found: ${subscription.id}`);
    }

    const userId = existingSubscription.user_id;
    const subscriptionType = existingSubscription.subscription_type;

    // Update subscription record
    const { error: updateSubError } = await client
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_end: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (updateSubError) {
      throw new Error(
        `Failed to update subscription: ${updateSubError.message}`,
      );
    }

    // Update profile based on subscription type and status
    if (subscriptionType === "main") {
      if (subscription.status === "active") {
        // Determine quota from price ID or metadata
        const priceId = subscription.items.data[0]?.price.id;
        const { data: packageData } = await client
          .from("subscription_packages")
          .select("level, quota_amount")
          .eq("stripe_price_id", priceId)
          .single();

        if (packageData) {
          const { error: profileError } = await client
            .from("profiles")
            .update({
              subscription_level: packageData.level,
              dynamic_qr_quota: packageData.quota_amount,
              subscription_status: subscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (profileError) {
            throw new Error(
              `Failed to update profile: ${profileError.message}`,
            );
          }
        }
      } else if (
        ["canceled", "unpaid", "past_due"].includes(subscription.status)
      ) {
        // Downgrade to free plan
        const { error: profileError } = await client
          .from("profiles")
          .update({
            subscription_level: 0,
            dynamic_qr_quota: 3, // Free tier quota
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (profileError) {
          throw new Error(
            `Failed to downgrade profile: ${profileError.message}`,
          );
        }
      }
    } else if (subscriptionType === "booster") {
      // Recalculate total booster quota from all active boosters
      const { data: activeBoosterSubs } = await client
        .from("subscriptions")
        .select(
          `
          stripe_price_id,
          quota_packages!inner(quantity)
        `,
        )
        .eq("user_id", userId)
        .eq("status", "active")
        .eq("subscription_type", "booster");

      const totalBoosterQuota =
        activeBoosterSubs?.reduce(
          (total: any, sub: { quota_packages: { quantity: any } }) => {
            return total + (sub.quota_packages?.quantity || 0);
          },
          0,
        ) || 0;

      const { error: profileError } = await client
        .from("profiles")
        .update({
          extra_quota_from_boosters: totalBoosterQuota,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        throw new Error(
          `Failed to update booster quota: ${profileError.message}`,
        );
      }
    }

    // Log the successful operation
    await client.from("webhook_operations").insert({
      webhook_event_id: subscription.id,
      operation_type: eventType,
      user_id: userId,
      success: true,
      completed_at: new Date().toISOString(),
    });
  });
}

// Rate limiting using Redis
const rateLimiter = {
  async checkRate(
    identifier: string,
    maxRequests = 100,
    windowMs = 60000,
  ): Promise<boolean> {
    const redis = new (await import("@upstash/redis")).Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const key = `rate_limit:${identifier}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    return current <= maxRequests;
  },
};

export async function POST(request: Request) {
  const startTime = Date.now();
  const body = await request.text();
  const signature = headers().get("stripe-signature") || "";
  const forwarded = headers().get("x-forwarded-for");
  const realIp = headers().get("x-real-ip");
  const clientIp = forwarded?.split(",")[0] || realIp || "unknown";

  // Rate limiting
  const isWithinRate = await rateLimiter.checkRate(
    `webhook:${clientIp}`,
    50,
    60000,
  );
  if (!isWithinRate) {
    console.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Enhanced signature verification
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Webhook secret not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const isValidSignature = verifyWebhookSignature(
    body,
    signature,
    webhookSecret,
  );
  if (!isValidSignature) {
    console.error("Invalid webhook signature from IP:", clientIp);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Stripe.Event;
  try {
    // Double verification with Stripe's built-in method
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook construction failed:", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Idempotency check with enhanced metadata
    const { data: existingEvent, error: eventCheckError } = await supabase
      .from("webhook_events")
      .select("id, processed_at, status, retry_count, processing_time_ms")
      .eq("stripe_event_id", event.id)
      .single();

    if (existingEvent?.status === "completed") {
      console.log(`⚠️ Event already processed: ${event.id}`);
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
        processedAt: existingEvent.processed_at,
        processingTime: existingEvent.processing_time_ms,
      });
    }

    // Record/update webhook event with security metadata
    const eventData = {
      stripe_event_id: event.id,
      event_type: event.type,
      status: "processing" as const,
      received_at: new Date().toISOString(),
      raw_data: event,
      client_ip: clientIp,
      retry_count: (existingEvent?.retry_count || 0) + 1,
    };

    if (!existingEvent) {
      await supabase.from("webhook_events").insert(eventData);
    } else {
      await supabase
        .from("webhook_events")
        .update(eventData)
        .eq("stripe_event_id", event.id);
    }

    // Process the webhook event with proper error handling
    let processingResult: { success: boolean; error?: string } = {
      success: false,
    };

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === "subscription") {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string,
            );
            await processSubscriptionUpdate(supabase, subscription, event.type);
          } else if (session.mode === "payment") {
            await processQuotaPurchase(supabase, session);
          }
          processingResult.success = true;
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await processSubscriptionUpdate(supabase, subscription, event.type);
          processingResult.success = true;
          break;
        }

        case "invoice.payment_succeeded":
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await processInvoiceEvent(supabase, invoice, event.type);
          processingResult.success = true;
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
          processingResult.success = true; // Don't fail for unhandled events
      }
    } catch (processingError) {
      console.error(`Processing error for ${event.type}:`, processingError);
      processingResult = {
        success: false,
        error:
          processingError instanceof Error
            ? processingError.message
            : "Processing failed",
      };
    }

    // Update webhook event status with comprehensive metadata
    const processingTime = Date.now() - startTime;
    const updateData = {
      status: processingResult.success ? "completed" : "failed",
      processed_at: new Date().toISOString(),
      processing_time_ms: processingTime,
      error_message: processingResult.error || null,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from("webhook_events")
      .update(updateData)
      .eq("stripe_event_id", event.id);

    // Alert on slow processing or failures
    if (processingTime > 5000 || !processingResult.success) {
      console.warn(
        `Webhook ${event.id} processed in ${processingTime}ms, success: ${processingResult.success}`,
      );
    }

    if (processingResult.success) {
      return NextResponse.json({
        received: true,
        processingTimeMs: processingTime,
        eventType: event.type,
      });
    } else {
      return NextResponse.json(
        {
          error: processingResult.error || "Processing failed",
          eventId: event.id,
          retryable: true,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("Critical webhook error:", error);

    // Record critical failure
    await supabase
      .from("webhook_events")
      .update({
        status: "failed",
        processed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
        error_message:
          error instanceof Error ? error.message : "Critical error",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_event_id", event.id);

    return NextResponse.json(
      {
        error: "Internal server error",
        eventId: event.id,
        retryable: true,
      },
      { status: 500 },
    );
  }
}

// Helper functions for specific event processing
async function processQuotaPurchase(
  supabase: any,
  session: Stripe.Checkout.Session,
): Promise<void> {
  await executeWithTransaction(supabase, async (client) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string,
    );

    const metadata = paymentIntent.metadata;
    const userId = metadata.user_id;
    const packageId = metadata.package_id;
    const quantity = parseInt(metadata.quantity || "0");

    if (!userId || !packageId || !quantity) {
      throw new Error("Missing required metadata for quota purchase");
    }

    // Record purchase
    await client.from("quota_purchases").insert({
      user_id: userId,
      package_id: packageId,
      quantity: quantity,
      stripe_checkout_id: session.id,
      amount_paid_cents: paymentIntent.amount,
      purchased_at: new Date().toISOString(),
    });

    // Update user quota
    const { data: profile } = await client
      .from("profiles")
      .select("extra_quota_from_boosters")
      .eq("id", userId)
      .single();

    const currentQuota = profile?.extra_quota_from_boosters || 0;
    const newQuota = currentQuota + quantity;

    await client
      .from("profiles")
      .update({
        extra_quota_from_boosters: newQuota,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  });
}

async function processInvoiceEvent(
  supabase: any,
  invoice: Stripe.Invoice,
  eventType: string,
): Promise<void> {
  // Log payment events for billing history
  await supabase.from("payment_events").insert({
    stripe_invoice_id: invoice.id,
    event_type:
      eventType === "invoice.payment_succeeded"
        ? "payment_succeeded"
        : "payment_failed",
    amount_paid: invoice.amount_paid || 0,
    amount_due: invoice.amount_due || 0,
    currency: invoice.currency,
    failure_reason:
      eventType === "invoice.payment_failed"
        ? invoice.last_finalization_error?.message || "Unknown"
        : null,
    processed_at: new Date().toISOString(),
  });

  // Handle subscription status updates for failed payments
  if (eventType === "invoice.payment_failed" && invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string,
    );
    await processSubscriptionUpdate(supabase, subscription, "payment_failed");
  }
}
