// /api/paddle/create-checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validatePaddleConfig } from "@/lib/paddle-config";

export async function POST(request: Request) {
  try {
    // ADDED: Validate configuration first
    const config = validatePaddleConfig();

    const { level } = await request.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the plan details
    const { data: plan, error } = await supabase
      .from("subscription_packages")
      .select("paddle_price_id, name")
      .eq("level", parseInt(level))
      .eq("is_active", true)
      .single();

    if (error || !plan?.paddle_price_id) {
      console.error("Plan lookup error:", error, { level, plan });
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Create Paddle checkout
    const checkoutResponse = await fetch(
      "https://api.paddle.com/checkout-sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              price_id: plan.paddle_price_id,
              quantity: 1,
            },
          ],
          customer_data: {
            email: user.email,
          },
          custom_data: {
            user_id: user.id,
          },
          success_url: `${config.siteUrl}/subscription?success=true`,
          cancel_url: `${config.siteUrl}/subscription?canceled=true`,
        }),
      },
    );

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error("Paddle API error:", {
        status: checkoutResponse.status,
        error: errorData,
        priceId: plan.paddle_price_id,
      });
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    const checkoutData = await checkoutResponse.json();
    return NextResponse.json({ url: checkoutData.data.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout" },
      { status: 500 },
    );
  }
}
