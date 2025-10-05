import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./config";

// Initialize Stripe
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});
