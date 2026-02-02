"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { createPaymentIntent } from "@/actions/paymentActions";
import { useAuthStore } from "@/zustand/useAuthStore";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { ClipLoader } from "react-spinners";

type Props = { amount: number };

export default function PaymentCheckoutPage({ amount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const uid = useAuthStore((state) => state.uid);

  useEffect(() => {
    async function initializePayment() {
      if (!uid) {
        setErrorMessage("Please sign in to make a payment");
        return;
      }

      try {
        const secret = await createPaymentIntent(
          convertToSubcurrency(amount),
          uid
        );
        if (secret) setClientSecret(secret);
      } catch (error) {
        console.error("Failed to initialize payment:", error);
        setErrorMessage("Failed to initialize payment. Please try again.");
      }
    }

    initializePayment();
  }, [amount, uid]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Payment failed");
        setLoading(false);
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?amount=${amount}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
      }
    } catch (error) {
      setErrorMessage("Payment validation failed. Please try again.");
      console.error("Payment validation error:", error);
    }

    setLoading(false);
  };

  if (!uid) {
    return (
      <div className="flex items-center justify-center max-w-6xl h-36 mx-auto w-full">
        <p className="text-gray-600">Please sign in to make a payment.</p>
      </div>
    );
  }

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center max-w-6xl h-36 mx-auto w-full">
        <ClipLoader color="#2563eb" size={36} />
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full items-center max-w-6xl mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Buy 10,000 Credits</h1>
        <h2 className="text-2xl text-gray-600 mt-2">
          Purchase amount: <span className="font-bold">${amount}</span>
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
        {clientSecret && <PaymentElement />}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errorMessage}
          </div>
        )}

        <button
          disabled={!stripe || loading}
          className="btn-primary w-full mt-4 py-4 text-lg"
        >
          {!loading ? `Pay $${amount}` : "Processing..."}
        </button>
      </form>
    </main>
  );
}
