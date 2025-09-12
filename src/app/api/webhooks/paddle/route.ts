// /api/webhooks/paddle/route.ts - Much simpler webhook
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

function verifyPaddleWebhook(body: string, signature: string): boolean {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET!;

  // Paddle v2 uses HMAC-SHA256
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(body);
  const expectedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex"),
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature =
      request.headers
        .get("paddle-signature")
        ?.replace("ts=", "")
        .split(",")[1]
        ?.replace("h1=", "") || "";

    if (!verifyPaddleWebhook(body, signature)) {
      console.error("Invalid Paddle signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const supabase = await createClient();

    console.log("Paddle v2 webhook received:", data.event_type);

    switch (data.event_type) {
      case "subscription.created":
        await handleSubscriptionCreated(supabase, data);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(supabase, data);
        break;
      case "subscription.canceled":
        await handleSubscriptionCancelled(supabase, data);
        break;
      case "transaction.completed":
        await handleTransactionCompleted(supabase, data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paddle webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleSubscriptionCreated(supabase: any, data: any) {
  const subscription = data.data;
  const customData = subscription.custom_data;
  const userId = customData.user_id;
  const planType = customData.type || "main";

  // Insert subscription record
  await supabase.from("subscriptions").insert({
    user_id: userId,
    paddle_checkout_id: subscription.id,
    plan_name: subscription.items[0]?.price.name || "Unknown",
    status: subscription.status,
    subscription_type: planType,
    current_period_end: subscription.current_billing_period?.ends_at,
    paddle_price_id: subscription.items[0]?.price.id,
  });

  // Update user profile
  if (planType === "main") {
    const priceId = subscription.items[0]?.price.id;
    const { data: packageData } = await supabase
      .from("subscription_packages")
      .select("level, quota_amount")
      .eq("paddle_price_id", priceId)
      .single();

    if (packageData) {
      await supabase
        .from("profiles")
        .update({
          subscription_level: packageData.level,
          dynamic_qr_quota: packageData.quota_amount,
          subscription_status: "active",
        })
        .eq("id", userId);
    }
  } else {
    // Handle booster
    const priceId = subscription.items[0]?.price.id;
    const { data: quotaData } = await supabase
      .from("quota_packages")
      .select("quantity")
      .eq("paddle_price_id", priceId)
      .single();

    if (quotaData) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("extra_quota_from_boosters")
        .eq("id", userId)
        .single();

      const currentExtra = profile?.extra_quota_from_boosters || 0;
      await supabase
        .from("profiles")
        .update({
          extra_quota_from_boosters: currentExtra + quotaData.quantity,
        })
        .eq("id", userId);
    }
  }
}

async function handleSubscriptionUpdated(supabase: any, data: any) {
  const subscription = data.data;

  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_end: subscription.current_billing_period?.ends_at,
    })
    .eq("paddle_checkout_id", subscription.id);
}

async function handleSubscriptionCancelled(supabase: any, data: any) {
  const subscription = data.data;

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
    })
    .eq("paddle_checkout_id", subscription.id);

  // Handle downgrade logic similar to v1 implementation
  const customData = subscription.custom_data;
  if (customData.type === "main") {
    await supabase
      .from("profiles")
      .update({
        subscription_level: 0,
        dynamic_qr_quota: 3,
        subscription_status: "canceled",
      })
      .eq("id", customData.user_id);
  }

  // Get subscription details to determine what to downgrade
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id, subscription_type")
    .eq("paddle_checkout_id", data.checkout?.id || data.subscription_id) // Use checkout ID
    .single();

  if (sub) {
    if (sub.subscription_type === "main") {
      // Downgrade to free
      await supabase
        .from("profiles")
        .update({
          subscription_level: 0,
          dynamic_qr_quota: 3,
          subscription_status: "cancelled",
        })
        .eq("id", sub.user_id);
    } else {
      // Remove booster quota
      const { data: quotaData } = await supabase
        .from("quota_packages")
        .select("quantity")
        .eq("paddle_price_id", data.subscription_plan_id)
        .single();

      if (quotaData) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("extra_quota_from_boosters")
          .eq("id", sub.user_id)
          .single();

        const currentExtra = profile?.extra_quota_from_boosters || 0;
        const newExtra = Math.max(0, currentExtra - quotaData.quantity);

        await supabase
          .from("profiles")
          .update({
            extra_quota_from_boosters: newExtra,
          })
          .eq("id", sub.user_id);
      }
    }
  }
}

async function handleTransactionCompleted(supabase: any, data: any) {
  const transaction = data.data;

  await supabase.from("payment_events").insert({
    paddle_payment_id: transaction.id,
    event_type: "transaction_completed",
    amount_paid: transaction.details.totals.total,
    currency: transaction.currency_code,
    processed_at: new Date().toISOString(),
  });
}
