import Stripe from "stripe";

let client: Stripe | null = null;

// Created lazily so `next build` doesn't need STRIPE_SECRET_KEY (preview builds don't have it).
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env["STRIPE_SECRET_KEY"];
    if (!key) throw new Error("STRIPE_SECRET_KEY is required");
    client = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  }
  return client;
}
