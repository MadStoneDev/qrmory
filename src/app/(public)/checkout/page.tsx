// src/app/checkout/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CheckoutComponent from "@/components/checkout-component";
import { getUserProfile, ensurePaddleCustomer } from "@/utils/supabase/queries";

export const metadata = {
  title: "Checkout",
  description: "Complete your QRmory subscription purchase.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ _ptxn?: string }>;
}) {
  const params = await searchParams;
  const transactionId = params._ptxn || null;

  const supabase = await createClient();
  const profile = await getUserProfile(supabase);

  if (!profile) {
    redirect("/login");
  }

  // Ensure Paddle customer exists before checkout
  const paddleCustomerId = await ensurePaddleCustomer(supabase);

  if (!paddleCustomerId) {
    // If we can't create a Paddle customer, redirect back with error
    redirect("/dashboard/subscription?error=paddle_customer_failed");
  }

  return (
    <CheckoutComponent
      profile={profile}
      paddleCustomerId={paddleCustomerId}
      transactionId={transactionId}
    />
  );
}
