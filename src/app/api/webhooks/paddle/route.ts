// /api/webhooks/paddle/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

function verifyPaddleWebhook(body: string, signature: string): boolean {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("PADDLE_WEBHOOK_SECRET not configured");
    return false;
  }

  // FIXED: Parse Paddle signature correctly
  const parts = signature.split(",");
  const timestamp = parts
    .find((part) => part.startsWith("ts="))
    ?.replace("ts=", "");
  const signatureHash = parts
    .find((part) => part.startsWith("h1="))
    ?.replace("h1=", "");

  if (!timestamp || !signatureHash) {
    console.error("Invalid signature format");
    return false;
  }

  // FIXED: Create signature the way Paddle expects
  const payload = timestamp + ":" + body;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signatureHash, "hex"),
    Buffer.from(expectedSignature, "hex"),
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("paddle-signature");

    if (!signature) {
      console.error("Missing paddle-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    if (!verifyPaddleWebhook(body, signature)) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const supabase = await createClient();

    switch (data.event_type) {
      case "subscription.created":
      case "subscription.updated":
        await handleSubscription(supabase, data);
        break;
      case "subscription.canceled":
      case "subscription.paused":
        await handleCancellation(supabase, data);
        break;
      default:
        console.log(`Unhandled event type: ${data.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleSubscription(supabase: any, data: any) {
  const subscription = data.data;
  const userId = subscription.custom_data?.user_id;
  const priceId = subscription.items?.[0]?.price?.id;

  if (!userId) {
    console.error("Missing user_id in webhook data", {
      subscription_id: subscription.id,
    });
    return;
  }

  if (!priceId) {
    console.error("Missing price_id in webhook data", {
      subscription_id: subscription.id,
    });
    return;
  }

  // Get plan details from price ID
  const { data: plan, error: planError } = await supabase
    .from("subscription_packages")
    .select("level, quota_amount, name")
    .eq("paddle_price_id", priceId)
    .single();

  if (planError || !plan) {
    console.error("No plan found for price_id:", priceId, planError);
    return;
  }

  try {
    // FIXED: Use user_id for conflict resolution since paddle_subscription_id might change
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          paddle_subscription_id: subscription.id,
          plan_name: plan.name,
          status: subscription.status,
          current_period_end:
            subscription.current_billing_period?.ends_at ||
            subscription.scheduled_change?.effective_at,
          paddle_price_id: priceId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id", // FIXED: Use user_id as primary conflict resolution
        },
      );

    if (subscriptionError) {
      console.error("Failed to upsert subscription:", subscriptionError);
      return;
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_level: plan.level,
        dynamic_qr_quota: plan.quota_amount,
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to update user profile:", profileError);
      return;
    }
  } catch (error) {
    console.error("Error handling subscription:", error);
    throw error;
  }
}

async function handleCancellation(supabase: any, data: any) {
  const subscription = data.data;
  const userId = subscription.custom_data?.user_id;

  if (!userId) {
    console.error("Missing user_id in cancellation webhook");
    return;
  }

  try {
    // Update subscription status
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("paddle_subscription_id", subscription.id);

    if (subscriptionError) {
      console.error("Failed to update subscription status:", subscriptionError);
    }

    // Reset user to free plan (level 0)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_level: 0,
        dynamic_qr_quota: 3, // Default free quota
        subscription_status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to reset user profile:", profileError);
      return;
    }
  } catch (error) {
    console.error("Error handling cancellation:", error);
    throw error;
  }
}
