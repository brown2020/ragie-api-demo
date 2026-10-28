"use client";

import PaymentCheckoutPage from "@/components/PaymentCheckoutPage";
import { PURCHASE_AMOUNT_CENTS, PURCHASE_AMOUNT_DOLLARS } from "@/lib/billing";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)
  : null;

export default function PaymentAttempt() {
  const amount = PURCHASE_AMOUNT_DOLLARS;

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center max-w-6xl h-36 mx-auto w-full">
        <p className="text-red-600">Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_KEY.</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: PURCHASE_AMOUNT_CENTS,
        currency: "usd",
      }}
    >
      <PaymentCheckoutPage amount={amount} />
    </Elements>
  );
}
