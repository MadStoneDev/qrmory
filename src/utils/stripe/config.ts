﻿import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? "",
  {
    apiVersion: "2024-06-20",
    appInfo: {
      name: "QRmory",
      url: "https://qrmory.com",
    },
  },
);
