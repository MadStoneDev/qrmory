// /api/paddle/create-portal/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's main subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("paddle_subscription_id")
      .eq("user_id", user.id)
      .eq("subscription_type", "main")
      .eq("status", "active")
      .single();

    if (!subscription?.paddle_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 404 },
      );
    }

    // Paddle billing portal URL
    const portalUrl = `https://checkout.paddle.com/subscription/update?subscription=${subscription.paddle_subscription_id}`;

    return NextResponse.json({ url: portalUrl });
  } catch (error: any) {
    console.error("Paddle portal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
