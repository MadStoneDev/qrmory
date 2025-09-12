// /api/paddle/create-checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const {
      plan_id,
      type = "main",
      success_url,
      cancel_url,
    } = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get plan details from your database
    let planDetails;
    if (type === "main") {
      const { data } = await supabase
        .from("subscription_packages")
        .select("*")
        .eq("id", plan_id)
        .single();
      planDetails = data;
    } else {
      const { data } = await supabase
        .from("quota_packages")
        .select("*")
        .eq("id", plan_id)
        .single();
      planDetails = data;
    }

    if (!planDetails) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Simple Paddle checkout URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const paddleCheckoutUrl = new URL("https://checkout.paddle.com/checkout");

    paddleCheckoutUrl.searchParams.set("vendor", process.env.PADDLE_VENDOR_ID!);
    paddleCheckoutUrl.searchParams.set("product", planDetails.paddle_price_id); // You'll need to add this field
    paddleCheckoutUrl.searchParams.set(
      "passthrough",
      JSON.stringify({
        user_id: user.id,
        plan_id: plan_id,
        type: type,
      }),
    );
    paddleCheckoutUrl.searchParams.set(
      "success_url",
      success_url || `${baseUrl}/subscription?success=true`,
    );
    paddleCheckoutUrl.searchParams.set(
      "cancel_url",
      cancel_url || `${baseUrl}/subscription?canceled=true`,
    );

    return NextResponse.json({ url: paddleCheckoutUrl.toString() });
  } catch (error: any) {
    console.error("Paddle checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
