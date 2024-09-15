"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { User } from "@supabase/supabase-js";
import type { Tables } from "@/types_db";

import SelectSwitch from "@/components/SelectSwitch";
import { checkoutWithStripe } from "@/utils/stripe/server";
import { getErrorRedirect } from "@/utils/helpers";
import { getStripe } from "@/utils/stripe/client";
import { Button } from "@/components/ui/button";

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
  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push("/login");
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath,
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          "An unknown error occurred",
          "Please try again later or contact support.",
        ),
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  if (!products.length) {
    return (
      <div className={`py-4 h-full`}>
        <p className="text-xl font-bold">
          No subscription pricing plans found.
        </p>
      </div>
    );
  } else {
    return (
      <>
        <SelectSwitch
          options={[
            { value: "month", label: "Monthly" },
            { value: "year", label: "Yearly" },
          ]}
          value={billingInterval}
          suffix={` billing`}
          onChange={(value) => setBillingInterval(value as BillingInterval)}
        />
        <section
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4`}
        >
          {products
            .sort((a, b) => {
              const priceA =
                a.prices.find((price) => price.interval === billingInterval)
                  ?.unit_amount || 0;
              const priceB =
                b.prices.find((price) => price.interval === billingInterval)
                  ?.unit_amount || 0;
              return priceA - priceB;
            })
            .map((product) => {
              const price = product?.prices?.find(
                (price) => price?.interval === billingInterval,
              );
              if (!price) return;

              return (
                <section className={`p-2 grid grid-cols-1`}>
                  <PricingPackage
                    key={product.id}
                    title="Free"
                    price={price}
                    description="Sample Description"
                    subscriptionID="basic"
                    subscription={subscription}
                    billingInterval={billingInterval}
                    // loading={priceIdLoading === price.id}
                    handleStripeCheckout={() => handleStripeCheckout(price)}
                  />
                </section>
              );
            })}
        </section>
      </>
    );
  }
}

interface PricingPackageProps {
  title?: string;
  price?: Price;
  priceString?: string;
  description?: string;
  subscriptionID?: string;
  subscription?: SubscriptionWithProduct | null;
  billingInterval?: BillingInterval;
  loading?: string;
  handleStripeCheckout: (price: Price) => void;
}

function PricingPackage({
  title = "Basic",
  price,
  description = "Sample Description",
  subscriptionID = "basic",
  subscription = null,
  billingInterval,
  loading = undefined,
  handleStripeCheckout,
}: PricingPackageProps) {
  const priceString = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format((price?.unit_amount || 0) / 100);

  return (
    <article
      className={`col-span-4 bg-stone-100 md:shadow-2xl shadow-stone-300 border border-stone-300`}
    >
      <div className={`p-4 bg-qrmory-purple-800 font-sans text-white`}>
        <h2 className={`text-lg font-sans font-semibold`}>{title}</h2>
        <h4 className={`text-sm font-sans font-light`}>{description}</h4>
      </div>

      <div
        className={`p-6 pt-12 flex flex-col gap-6 text-4xl md:text-5xl text-qrmory-purple-800`}
      >
        <p className={`font-sans`} style={{ fontWeight: 800 }}>
          {price ? (
            <>
              {isNaN(parseInt(priceString[0])) ? (
                <>
                  <span className={`text-3xl md:text-4xl`}>
                    {priceString[0]}
                  </span>
                  {priceString.substring(1)}
                </>
              ) : (
                // <span className={`text-3xl md:text-4xl`}>{priceString[0]}</span>
                { priceString }
              )}
            </>
          ) : (
            "Free"
          )}
          <span className={`text-lg font-light`}>/{billingInterval}</span>
        </p>

        <Button
          onClick={() => handleStripeCheckout}
          // loading={loading}
          className={`p-3 bg-qrmory-purple-800 rounded-md text-sm font-bold text-center text-white`}
        >
          {subscription ? "Manage" : "Subscribe"}
        </Button>
      </div>
    </article>
  );
}
