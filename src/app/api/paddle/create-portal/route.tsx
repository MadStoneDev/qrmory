﻿// /api/paddle/create-portal/route.ts
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

    // Get user's active subscription - FIXED: removed non-existent subscription_type filter
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("paddle_subscription_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!subscription?.paddle_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    // FIXED: Use correct Paddle portal URL structure
    const response = await fetch(
      "https://api.paddle.com/billing-portal-sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: subscription.paddle_subscription_id,
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription`,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Paddle portal error:", errorData);
      return NextResponse.json(
        { error: "Failed to create portal session" },
        { status: 500 },
      );
    }

    const portalData = await response.json();
    return NextResponse.json({ url: portalData.data.url });
  } catch (error: any) {
    console.error("Portal creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
