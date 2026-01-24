import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
  SubscriptionCanceledEvent,
  SubscriptionCreatedEvent,
  SubscriptionPausedEvent,
  SubscriptionUpdatedEvent,
  TransactionCompletedEvent,
} from "@paddle/paddle-node-sdk";
import { supabaseAdmin } from "@/utils/supabase/admin";
import {
  sendSubscriptionCanceledEmail,
  sendCodesDeactivatedEmail,
  sendSubscriptionConfirmedEmail,
  sendSubscriptionDowngradedEmail,
} from "@/lib/email/send-email";

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    console.log(`Processing webhook event: ${eventData.eventType}`);

    switch (eventData.eventType) {
      case EventName.TransactionCompleted:
        await this.handleTransactionCompleted(
          eventData as TransactionCompletedEvent,
        );
        break;
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await this.updateCustomerData(eventData);
        break;
      case EventName.SubscriptionCanceled:
      case EventName.SubscriptionPaused:
        await this.handleSubscriptionEnded(eventData);
        break;
    }
  }

  private async handleSubscriptionEnded(
    eventData: SubscriptionCanceledEvent | SubscriptionPausedEvent,
  ) {
    const customerId = eventData.data.customerId;
    const FREE_TIER_QUOTA = 3;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("paddle_customer_id", customerId)
      .single();

    if (!profile) return;

    // Get user email for notifications
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const userEmail = authData?.user?.email;

    // Update subscription status
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: eventData.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id);

    // Downgrade profile to free tier
    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_level: 0,
        dynamic_qr_quota: FREE_TIER_QUOTA,
        subscription_status: eventData.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    // Get all user's dynamic QR codes, ordered by created_at (oldest first)
    const { data: dynamicCodes } = await supabaseAdmin
      .from("qr_codes")
      .select("id, title, shortcode, created_at, is_active")
      .eq("user_id", profile.id)
      .eq("type", "dynamic")
      .order("created_at", { ascending: true });

    if (!dynamicCodes || dynamicCodes.length <= FREE_TIER_QUOTA) {
      // User has fewer codes than free tier allows, send cancellation email only
      if (userEmail) {
        await sendSubscriptionCanceledEmail(userEmail, {
          codesDeactivated: 0,
          codesRemaining: dynamicCodes?.length || 0,
        });
      }
      return;
    }

    // Deactivate excess codes (oldest first, keeping the newest ones active)
    const codesToDeactivate = dynamicCodes.slice(0, dynamicCodes.length - FREE_TIER_QUOTA);
    const codesToKeepActive = dynamicCodes.slice(-FREE_TIER_QUOTA);

    // Deactivate the oldest excess codes
    const deactivatedIds = codesToDeactivate.map(code => code.id);

    if (deactivatedIds.length > 0) {
      const { error: deactivateError } = await supabaseAdmin
        .from("qr_codes")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .in("id", deactivatedIds);

      if (deactivateError) {
        console.error("Error deactivating QR codes:", deactivateError);
      } else {
        console.log(`✅ Deactivated ${deactivatedIds.length} dynamic QR codes for user ${profile.id}`);
      }
    }

    // Ensure the newest codes within quota remain active
    const activeIds = codesToKeepActive.map(code => code.id);
    if (activeIds.length > 0) {
      await supabaseAdmin
        .from("qr_codes")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .in("id", activeIds);
    }

    // Send email notification about deactivated codes
    if (userEmail) {
      await sendCodesDeactivatedEmail(userEmail, {
        deactivatedCodes: codesToDeactivate.map(code => ({
          title: code.title,
          shortcode: code.shortcode,
        })),
        activeCodes: codesToKeepActive.map(code => ({
          title: code.title,
          shortcode: code.shortcode,
        })),
        totalDeactivated: codesToDeactivate.length,
        freeQuota: FREE_TIER_QUOTA,
      });
    }
  }

  private async handleTransactionCompleted(
    eventData: TransactionCompletedEvent,
  ) {
    const subscriptionId = eventData.data.subscriptionId;

    if (!subscriptionId) {
      console.log(
        "No subscription ID in transaction - likely a one-time purchase",
      );
      return;
    }

    // Extract subscription details from the transaction
    const customerId = eventData.data.customerId;
    const priceId = eventData.data.items[0]?.price?.id;

    if (!customerId || !priceId) {
      console.error("Missing customer_id or price_id in transaction");
      return;
    }

    // Find the user by Paddle customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("paddle_customer_id", customerId)
      .single();

    if (!profile) {
      console.error(`No user found for Paddle customer ID: ${customerId}`);
      return;
    }

    // Get user email for notifications
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const userEmail = authData?.user?.email;

    // Get subscription package details
    const { data: subscriptionPackage } = await supabaseAdmin
      .from("subscription_packages")
      .select("level, quota_amount, name")
      .eq("paddle_price_id", priceId)
      .eq("is_active", true)
      .single();

    if (!subscriptionPackage) {
      console.error(`No subscription package found for price ID: ${priceId}`);
      return;
    }

    // Create/update subscription
    const subscriptionData = {
      user_id: profile.id,
      paddle_subscription_id: subscriptionId,
      paddle_checkout_id: eventData.data.id,
      paddle_price_id: priceId,
      status: "active",
      current_period_end:
        eventData.data.billingPeriod?.endsAt || new Date().toISOString(),
      plan_name: subscriptionPackage.name,
      updated_at: new Date().toISOString(),
    };

    const { error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(subscriptionData, {
        onConflict: "user_id",
      });

    if (subscriptionError) {
      console.error("Error upserting subscription:", subscriptionError);
      throw subscriptionError;
    }

    // Update profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_level: subscriptionPackage.level,
        dynamic_qr_quota: subscriptionPackage.quota_amount,
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    // Reactivate all user's dynamic QR codes (within new quota)
    const { data: dynamicCodes } = await supabaseAdmin
      .from("qr_codes")
      .select("id")
      .eq("user_id", profile.id)
      .eq("type", "dynamic")
      .order("created_at", { ascending: false })
      .limit(subscriptionPackage.quota_amount);

    if (dynamicCodes && dynamicCodes.length > 0) {
      const codesToReactivate = dynamicCodes.map(code => code.id);

      const { error: reactivateError } = await supabaseAdmin
        .from("qr_codes")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .in("id", codesToReactivate);

      if (reactivateError) {
        console.error("Error reactivating QR codes:", reactivateError);
      } else {
        console.log(`✅ Reactivated ${codesToReactivate.length} dynamic QR codes for user ${profile.id}`);
      }
    }

    // Send subscription confirmed email
    if (userEmail) {
      const storageQuotas: Record<number, string> = {
        0: "50MB",
        1: "500MB",
        2: "2GB",
        3: "10GB",
      };

      await sendSubscriptionConfirmedEmail(userEmail, {
        planName: subscriptionPackage.name,
        dynamicQrQuota: subscriptionPackage.quota_amount,
        storageQuota: storageQuotas[subscriptionPackage.level] || "50MB",
      });
    }

    console.log(
      `✅ Successfully processed transaction for user ${profile.id}, level: ${subscriptionPackage.level}`,
    );
  }

  private async updateSubscriptionData(
    eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent,
  ) {
    // First, find the user by their Paddle customer ID (include current quota for comparison)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_level, dynamic_qr_quota")
      .eq("paddle_customer_id", eventData.data.customerId)
      .single();

    if (!profile) {
      console.error(
        `No user found for Paddle customer ID: ${eventData.data.customerId}`,
      );
      return;
    }

    // Get user email for notifications
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const userEmail = authData?.user?.email;

    // Get the subscription package details from the price ID
    const priceId = eventData.data.items[0]?.price?.id;
    if (!priceId) {
      console.error("No price ID found in subscription data");
      return;
    }

    const { data: subscriptionPackage } = await supabaseAdmin
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

    const { error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(subscriptionData, {
        onConflict: "user_id",
      });

    if (subscriptionError) {
      console.error("Error updating subscription:", subscriptionError);
      throw subscriptionError;
    }

    // Update user profile with subscription details
    const profileUpdate: Record<string, unknown> = {
      subscription_status: eventData.data.status,
      updated_at: new Date().toISOString(),
    };

    // Only update level and quota if we found the package
    if (subscriptionPackage) {
      profileUpdate.subscription_level = subscriptionPackage.level;
      profileUpdate.dynamic_qr_quota = subscriptionPackage.quota_amount;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", profile.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    // Check if this is a downgrade (quota reduced)
    const oldQuota = profile.dynamic_qr_quota || 0;
    const newQuota = subscriptionPackage?.quota_amount || oldQuota;
    const isDowngrade = newQuota < oldQuota;

    if (isDowngrade && subscriptionPackage) {
      console.log(`Downgrade detected for user ${profile.id}: ${oldQuota} -> ${newQuota} quota`);

      // Get all user's active dynamic QR codes, ordered by created_at (oldest first)
      const { data: dynamicCodes } = await supabaseAdmin
        .from("qr_codes")
        .select("id, title, shortcode, created_at, is_active")
        .eq("user_id", profile.id)
        .eq("type", "dynamic")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (dynamicCodes && dynamicCodes.length > newQuota) {
        // Calculate how many codes need to be deactivated
        const excessCount = dynamicCodes.length - newQuota;
        const codesToDeactivate = dynamicCodes.slice(0, excessCount);
        const codesToKeepActive = dynamicCodes.slice(excessCount);

        // Deactivate the oldest excess codes
        const deactivatedIds = codesToDeactivate.map(code => code.id);

        if (deactivatedIds.length > 0) {
          const { error: deactivateError } = await supabaseAdmin
            .from("qr_codes")
            .update({
              is_active: false,
              updated_at: new Date().toISOString(),
            })
            .in("id", deactivatedIds);

          if (deactivateError) {
            console.error("Error deactivating QR codes on downgrade:", deactivateError);
          } else {
            console.log(`✅ Deactivated ${deactivatedIds.length} dynamic QR codes for user ${profile.id} (downgrade)`);
          }

          // Send downgrade notification email
          if (userEmail) {
            await sendSubscriptionDowngradedEmail(userEmail, {
              oldPlanName: this.getPlanNameFromLevel(profile.subscription_level ?? 0),
              newPlanName: subscriptionPackage.name,
              oldQuota: oldQuota,
              newQuota: newQuota,
              deactivatedCodes: codesToDeactivate.map(code => ({
                title: code.title,
                shortcode: code.shortcode,
              })),
              activeCodes: codesToKeepActive.map(code => ({
                title: code.title,
                shortcode: code.shortcode,
              })),
            });
          }
        }
      } else if (userEmail) {
        // Downgrade but no codes need deactivation (user is under new limit)
        await sendSubscriptionDowngradedEmail(userEmail, {
          oldPlanName: this.getPlanNameFromLevel(profile.subscription_level ?? 0),
          newPlanName: subscriptionPackage.name,
          oldQuota: oldQuota,
          newQuota: newQuota,
          deactivatedCodes: [],
          activeCodes: [],
        });
      }
    }

    console.log(`Successfully updated subscription for user ${profile.id}`);
  }

  private getPlanNameFromLevel(level: number): string {
    const planNames: Record<number, string> = {
      0: "Free",
      1: "Explorer",
      2: "Creator",
      3: "Champion",
    };
    return planNames[level] || "Unknown";
  }

  private async updateCustomerData(
    eventData: CustomerCreatedEvent | CustomerUpdatedEvent,
  ) {
    // Find user by email and update their Paddle customer ID
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const user = authData.users.find((u) => u.email === eventData.data.email);

    if (!user) {
      console.error(`No user found for email: ${eventData.data.email}`);
      return;
    }

    const { error } = await supabaseAdmin
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
