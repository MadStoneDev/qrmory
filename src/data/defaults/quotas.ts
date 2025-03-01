export const SUBSCRIPTION_LEVELS = {
  0: "Free",
  1: "Explorer",
  2: "Creator",
  3: "Champion",
};

export const DEFAULT_QUOTAS = [
  {
    subscription: SUBSCRIPTION_LEVELS[0],
    dynamicCodes: 3,
  },
  {
    subscription: SUBSCRIPTION_LEVELS[1],
    dynamicCodes: 10,
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
