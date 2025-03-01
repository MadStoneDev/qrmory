import { loadStripe } from "@stripe/stripe-js";

const handler = async () => {
  const stripe = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  );
};
