export type SubscriptionLevel = "0" | "1" | "2" | "3" | "4";

export const SUBSCRIPTION_LEVELS = {
  "0": "Free",
  "1": "Explorer",
  "2": "Creator",
  "3": "Champion",
};

export const SUBSCRIPTION_PRICES = {
  "1": 499, // $4.99/mo
  "2": 1299, // $12.99/mo
  "3": 3999, // $39.99/mo
};

export const BOOSTER_PACKAGES = {
  Small: {
    price: 699, // $6.99
    quantity: 15,
    name: "Small Booster",
  },
  Medium: {
    price: 1599, // $15.99
    quantity: 75,
    name: "Medium Booster",
  },
  Large: {
    price: 1999, // $19.99
    quantity: 150,
    name: "Large Booster",
  },
};

export type QuotaInfo = {
  subscription: string;
  dynamicCodes: number;
  price?: number;
  features?: string[];
};

export const DEFAULT_QUOTAS: QuotaInfo[] = [
  {
    subscription: SUBSCRIPTION_LEVELS["0"],
    dynamicCodes: 3,
    features: [
      "3 Dynamic QR codes",
      "Unlimited Static QR codes",
      "Basic analytics",
      "Standard support",
    ],
  },
  {
    subscription: SUBSCRIPTION_LEVELS["1"],
    dynamicCodes: 10,
    price: SUBSCRIPTION_PRICES["1"],
    features: [
      "10 Dynamic QR codes",
      "Unlimited Static QR codes",
      "Enhanced analytics",
      "Priority support",
      "Custom QR code styles",
    ],
  },
  {
    subscription: SUBSCRIPTION_LEVELS["2"],
    dynamicCodes: 50,
    price: SUBSCRIPTION_PRICES["2"],
    features: [
      "50 Dynamic QR codes",
      "Unlimited Static QR codes",
      "Advanced analytics",
      "Priority support",
      "Custom QR code styles",
      "Bulk generation",
    ],
  },
  {
    subscription: SUBSCRIPTION_LEVELS["3"],
    dynamicCodes: 250,
    price: SUBSCRIPTION_PRICES["3"],
    features: [
      "250 Dynamic QR codes",
      "Unlimited Static QR codes",
      "Enterprise analytics",
      "Dedicated support",
      "Custom QR code styles",
      "Bulk generation",
      "Team sharing",
    ],
  },
];
