// /api/webhooks/paddle/route.ts - Much simpler webhook
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

function verifyPaddleWebhook(body: string, signature: string): boolean {
  const publicKey = process.env.PADDLE_PUBLIC_KEY!;

  // Paddle uses PHP-style serialization, convert to query string for verification
  const verify = crypto.createVerify("sha1");
  verify.update(body);
  return verify.verify(publicKey, signature, "base64");
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("paddle-signature") || "";

    if (!verifyPaddleWebhook(body, signature)) {
      console.error("Invalid Paddle signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const supabase = await createClient();

    console.log("Paddle webhook received:", data.alert_name);

    switch (data.alert_name) {
      case "subscription_created":
        await handleSubscriptionCreated(supabase, data);
        break;
      case "subscription_updated":
        await handleSubscriptionUpdated(supabase, data);
        break;
      case "subscription_cancelled":
        await handleSubscriptionCancelled(supabase, data);
        break;
      case "payment_succeeded":
        await handlePaymentSucceeded(supabase, data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paddle webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleSubscriptionCreated(supabase: any, data: any) {
  const passthrough = JSON.parse(data.passthrough);
  const userId = passthrough.user_id;
  const planType = passthrough.type || "main";

  // Insert subscription record
  await supabase.from("subscriptions").insert({
    user_id: userId,
    paddle_subscription_id: data.subscription_id,
    plan_name: data.subscription_plan_id,
    status: data.status,
    subscription_type: planType,
    current_period_end: new Date(data.next_bill_date).toISOString(),
    paddle_price_id: data.subscription_plan_id,
  });

  // Update user profile based on plan type
  if (planType === "main") {
    // Get quota from your plan
    const { data: packageData } = await supabase
      .from("subscription_packages")
      .select("level, quota_amount")
      .eq("paddle_price_id", data.subscription_plan_id)
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
    // Handle booster - add to extra quota
    const { data: quotaData } = await supabase
      .from("quota_packages")
      .select("quantity")
      .eq("paddle_price_id", data.subscription_plan_id)
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
  await supabase
    .from("subscriptions")
    .update({
      status: data.status,
      current_period_end: new Date(data.next_bill_date).toISOString(),
    })
    .eq("paddle_subscription_id", data.subscription_id);
}

async function handleSubscriptionCancelled(supabase: any, data: any) {
  // Update subscription status
  await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
    })
    .eq("paddle_subscription_id", data.subscription_id);

  // Get subscription details to determine what to downgrade
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id, subscription_type")
    .eq("paddle_subscription_id", data.subscription_id)
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

async function handlePaymentSucceeded(supabase: any, data: any) {
  // Log successful payment for billing history
  await supabase.from("payment_events").insert({
    paddle_payment_id: data.payment_id,
    event_type: "payment_succeeded",
    amount_paid: Math.round(parseFloat(data.sale_gross) * 100), // Convert to cents
    currency: data.currency,
    processed_at: new Date().toISOString(),
  });
}
