import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
} from "@paddle/paddle-node-sdk";
import { createClient } from "@/utils/supabase/server";

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    console.log(`Processing webhook event: ${eventData.eventType}`);

    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await this.updateCustomerData(eventData);
        break;
    }
  }

  private async updateSubscriptionData(
    eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent,
  ) {
    const supabase = await createClient();

    // First, find the user by their Paddle customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, subscription_level")
      .eq("paddle_customer_id", eventData.data.customerId)
      .single();

    if (!profile) {
      console.error(
        `No user found for Paddle customer ID: ${eventData.data.customerId}`,
      );
      return;
    }

    // Get the subscription package details from the price ID
    const priceId = eventData.data.items[0]?.price?.id;
    if (!priceId) {
      console.error("No price ID found in subscription data");
      return;
    }

    const { data: subscriptionPackage } = await supabase
      .from("subscription_packages")
      .select("level, quota_amount, name")
      .eq("paddle_price_id", priceId)
      .eq("is_active", true)
      .single();

    // Update or create subscription record
    const subscriptionData = {
      user_id: profile.id,
      paddle_subscription_id: eventData.data.id,
      paddle_price_id: priceId,
      status: eventData.data.status,
      current_period_end:
        eventData.data.currentBillingPeriod?.endsAt || new Date().toISOString(),
      plan_name: subscriptionPackage?.name || "Unknown Plan",
      updated_at: new Date().toISOString(),
    };

    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(subscriptionData, {
        onConflict: "user_id",
      });

    if (subscriptionError) {
      console.error("Error updating subscription:", subscriptionError);
      throw subscriptionError;
    }

    // Update user profile with subscription details
    const profileUpdate: any = {
      subscription_status: eventData.data.status,
      updated_at: new Date().toISOString(),
    };

    // Only update level and quota if we found the package
    if (subscriptionPackage) {
      profileUpdate.subscription_level = subscriptionPackage.level;
      profileUpdate.dynamic_qr_quota = subscriptionPackage.quota_amount;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", profile.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    console.log(`Successfully updated subscription for user ${profile.id}`);
  }

  private async updateCustomerData(
    eventData: CustomerCreatedEvent | CustomerUpdatedEvent,
  ) {
    const supabase = await createClient();

    // Find user by email and update their Paddle customer ID
    const { data: authData } = await supabase.auth.admin.listUsers();
    const user = authData.users.find((u) => u.email === eventData.data.email);

    if (!user) {
      console.error(`No user found for email: ${eventData.data.email}`);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        paddle_customer_id: eventData.data.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating customer data:", error);
      throw error;
    }

    console.log(`Successfully updated customer data for user ${user.id}`);
  }
}
