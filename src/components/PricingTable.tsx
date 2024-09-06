"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { User } from "@supabase/supabase-js";
import type { Tables } from "../../types_db";

type Subscription = Tables<"subscriptions">;
type Product = Tables<"products">;
type Price = Tables<"prices">;

interface ProductWithPrices extends Product {
  prices: Price[];
}

interface PriceWithProduct extends Price {
  product: Product | null;
}

interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = "lifetime" | "year" | "month";

export default function PricingTable({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap(
        (product) => product?.prices?.map((price) => price?.interval),
      ),
    ),
  );

  // Hooks
  const router = useRouter();
  const currentPath = usePathname();

  // States
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  // Functions
  const handleStripeCheckout = async () => {
    // setPriceIdLoading(price.id);
    // if (!user) {
    //   setPriceIdLoading(undefined);
    //   return router.push("/login");
    // }
    // const {errorRedirect, sessionId} = await
  };

  if (!products.length) {
    return (
      <div className={`py-4`}>
        <p className="text-2xl sm:text-4xl font-extrabold">
          No subscription pricing plans found.
        </p>
      </div>
    );
  } else {
    return (
      <>
        <section className={`grid grid-cols-1 sm:grid-cols-6 gap-4`}>
          {/*<PricingPackage />*/}
          {/*<PricingPackage />*/}
          {/*<PricingPackage />*/}
          {/*<PricingPackage />*/}
        </section>
      </>
    );
  }
}

function PricingPackage(
  title: string,
  price: number,
  description: string,
  subscriptionID: string,
) {
  return (
    <article className={`shadow-xl shadow-stone-500`}>
      <div className={`p-4 bg-qrmory-purple-800 font-sans text-white`}>
        <h2 className={`text-lg font-sans font-semibold`}>Basic</h2>
        <h4 className={`text-sm font-sans font-light`}>Short tagline</h4>
      </div>

      <div className={`flex`}>
        <span className={`mt-1 text-sm`}>$</span>
        <p className={`text-4xl`}>100</p>
      </div>

      <div></div>
    </article>
  );
}
