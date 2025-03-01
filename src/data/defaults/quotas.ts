export const SUBSCRIPTION_LEVELS = {
  0: "Free",
  1: "Starter",
  2: "Plus",
  3: "Premium",
};

export const DEFAULT_QUOTAS = [
  {
    subscription: SUBSCRIPTION_LEVELS[0],
    dynamicCodes: 2,
  },
  {
    subscription: SUBSCRIPTION_LEVELS[1],
    dynamicCodes: 5,
  },
  {
    subscription: SUBSCRIPTION_LEVELS[2],
    dynamicCodes: 50,
  },
  {
    subscription: SUBSCRIPTION_LEVELS[3],
    dynamicCodes: 250,
  },
];
