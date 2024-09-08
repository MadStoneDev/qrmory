"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { User } from "@supabase/supabase-js";
import type { Tables } from "@/types_db";

import Link from "next/link";

import SelectSwitch from "@/components/SelectSwitch";

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
      <div className={`py-4 h-full`}>
        <p className="text-2xl sm:text-4xl font-extrabold">
          No subscription pricing plans found.
        </p>
        <SelectSwitch
          options={[
            { value: "month", label: "Monthly" },
            { value: "year", label: "Yearly" },
          ]}
          value={billingInterval}
          onChange={(value) => setBillingInterval(value as BillingInterval)}
        />
        <section
          className={`p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4`}
        >
          <PricingPackage
            title="Free"
            price={0}
            description="Sample Description"
            subscriptionID="basic"
            billingInterval={billingInterval}
          />

          <PricingPackage
            title="Basic"
            price={6}
            description="Sample Description"
            subscriptionID="basic"
            billingInterval={billingInterval}
          />

          <PricingPackage
            title="Plus"
            price={12}
            description="Sample Description"
            subscriptionID="basic"
            billingInterval={billingInterval}
          />

          <PricingPackage
            title="Pro"
            price={20}
            description="Sample Description"
            subscriptionID="basic"
            billingInterval={billingInterval}
          />
        </section>
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

interface PricingPackageProps {
  title?: string;
  price?: number;
  description?: string;
  subscriptionID?: string;
  billingInterval?: BillingInterval;
}

function PricingPackage({
  title = "Basic",
  price = 4.99,
  description = "Sample Description",
  subscriptionID = "basic",
  billingInterval,
}: PricingPackageProps) {
  return (
    <article className={`bg-stone-100 md:shadow-2xl shadow-stone-300`}>
      <div className={`p-4 bg-qrmory-purple-800 font-sans text-white`}>
        <h2 className={`text-lg font-sans font-semibold`}>{title}</h2>
        <h4 className={`text-sm font-sans font-light`}>{description}</h4>
      </div>

      <div
        className={`p-6 pt-12 flex flex-col gap-6 text-4xl md:text-5xl text-qrmory-purple-800`}
      >
        <p className={`font-sans`} style={{ fontWeight: 800 }}>
          {price > 0 ? (
            <>
              <span className={`text-3xl md:text-4xl`}>$</span>
              {price}
            </>
          ) : (
            "Free"
          )}
          <span className={`text-lg font-light`}>/{billingInterval}</span>
        </p>

        <Link
          href={`/`}
          className={`p-2.5 bg-qrmory-purple-800 rounded-md text-sm font-bold text-center text-white`}
        >
          Get Started
        </Link>
      </div>
    </article>
  );
}
