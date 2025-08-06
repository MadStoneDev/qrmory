// /api/webhooks/stripe/route.ts - Fixed metadata handling
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  console.log("🔔 Webhook received!");

  const body = await request.text();
  const signature = headers().get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
    console.log("✅ Webhook signature verified");
    console.log("📧 Event type:", event.type);
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("🛒 Checkout session completed:");
        console.log("  - Session ID:", session.id);
        console.log("  - Mode:", session.mode);
        console.log("  - Customer:", session.customer);
        console.log("  - Subscription:", session.subscription);
        console.log("  - Session Metadata:", session.metadata);

        if (session.mode === "subscription") {
          console.log("📦 Processing subscription checkout...");

          // Get the subscription from Stripe
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          console.log("📋 Subscription metadata:", subscription.metadata);

          // Try to get metadata from multiple sources
          let metadata = session.metadata || {};

          // If session metadata is empty, try subscription metadata
          if (Object.keys(metadata).length === 0) {
            console.log(
              "📝 Session metadata empty, using subscription metadata",
            );
            metadata = subscription.metadata || {};
          }

          // If still no metadata, try to get it from customer
          if (Object.keys(metadata).length === 0 && session.customer) {
            console.log("📝 No metadata found, trying customer metadata");
            try {
              const customer = await stripe.customers.retrieve(
                session.customer as string,
              );
              if (typeof customer !== "string" && customer.metadata) {
                metadata = customer.metadata;
              }
            } catch (error) {
              console.log("⚠️ Could not retrieve customer:", error);
            }
          }

          console.log("🏷️ Final metadata:", metadata);

          let userId = metadata.user_id;
          let packageId = metadata.package_id;
          let subscriptionLevel = metadata.subscription_level;
          let quotaAmount = metadata.quota_amount;

          // If we still don't have user_id, try to find it by customer ID
          if (!userId && session.customer) {
            console.log("🔍 Looking up user by customer ID:", session.customer);
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("stripe_customer_id", session.customer)
              .single();

            if (profile) {
              userId = profile.id;
              console.log("✅ Found user ID:", userId);
            }
          }

          // If we don't have package info, try to find it by price ID
          if (!packageId && subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            console.log("🔍 Looking up package by price ID:", priceId);

            const { data: package } = await supabase
              .from("subscription_packages")
              .select("*")
              .eq("stripe_price_id", priceId)
              .single();

            if (package) {
              packageId = package.id;
              subscriptionLevel = package.level.toString();
              quotaAmount = package.quota_amount.toString();
              console.log("✅ Found package:", package);
            }
          }

          if (!userId) {
            console.error("❌ Could not determine user ID");
            return NextResponse.json(
              { error: "Could not determine user ID" },
              { status: 400 },
            );
          }

          console.log("🎯 Processing with:");
          console.log("  - User ID:", userId);
          console.log("  - Package ID:", packageId);
          console.log("  - Subscription Level:", subscriptionLevel);
          console.log("  - Quota Amount:", quotaAmount);

          // Update user profile
          console.log("🔄 Updating user profile...");

          const { error: profileUpdateError } = await supabase
            .from("profiles")
            .update({
              subscription_level: parseInt(subscriptionLevel || "1"),
              dynamic_qr_quota: parseInt(quotaAmount || "10"),
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (profileUpdateError) {
            console.error("❌ Profile update failed:", profileUpdateError);
          } else {
            console.log("✅ Profile updated successfully");
          }

          // Create subscription record
          console.log("📝 Creating subscription record...");

          const { error: subscriptionInsertError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0]?.price.id,
              status: subscription.status,
              plan_name: metadata.plan_name || "Explorer",
              current_period_end: new Date(
                subscription.current_period_end * 1000,
              ).toISOString(),
            });

          if (subscriptionInsertError) {
            console.error(
              "❌ Subscription record creation failed:",
              subscriptionInsertError,
            );
          } else {
            console.log("✅ Subscription record created successfully");
          }

          // Verify the updates
          const { data: updatedProfile } = await supabase
            .from("profiles")
            .select("subscription_level, dynamic_qr_quota, subscription_status")
            .eq("id", userId)
            .single();

          console.log("🔍 Updated profile:", updatedProfile);
        }

        break;
      }

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("💥 Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
