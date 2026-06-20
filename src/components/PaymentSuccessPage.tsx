"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { processPaymentIntent } from "@/actions/paymentActions";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { getFirebaseIdToken } from "@/firebase/firebaseClient";

type Props = {
  payment_intent: string;
};

export default function PaymentSuccessPage({ payment_intent }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    id: string;
    amount: number;
    created: number;
    status: string;
    creditsAdded: number;
  } | null>(null);

  const uid = useAuthStore((state) => state.uid);

  useEffect(() => {
    let cancelled = false;

    const handlePaymentSuccess = async () => {
      if (!payment_intent) {
        if (!cancelled) {
          setMessage("No payment intent found");
          setLoading(false);
        }
        return;
      }

      if (!uid) {
        if (!cancelled) {
          setMessage("Please sign in to view payment status");
          setLoading(false);
        }
        return;
      }

      try {
        const idToken = await getFirebaseIdToken();
        const data = await processPaymentIntent(payment_intent, idToken);

        if (cancelled) return;

        if (data.status === "succeeded") {
          if (data.alreadyProcessed) {
            setMessage("Payment has already been processed.");
          } else {
            toast.success(`${data.creditsAdded.toLocaleString()} credits added!`);
            setMessage("Payment successful");
          }

          setPaymentData({
            id: data.id,
            amount: data.amount,
            created: data.created * 1000,
            status: data.status,
            creditsAdded: data.creditsAdded,
          });
        } else {
          setMessage("Payment validation failed");
        }
      } catch {
        if (!cancelled) {
          setMessage("Error validating payment. Please contact support.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      void handlePaymentSuccess();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [payment_intent, uid]);

  return (
    <main className="max-w-2xl mx-auto p-6 md:p-10">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <ClipLoader color="#2563eb" size={40} />
            <p className="text-gray-600">Validating payment...</p>
          </div>
        ) : paymentData ? (
          <div className="space-y-4">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-gray-800">Thank you!</h1>
            <h2 className="text-xl text-gray-600">
              You successfully purchased credits
            </h2>
            {paymentData.creditsAdded > 0 && (
              <p className="text-sm text-green-700">
                {paymentData.creditsAdded.toLocaleString()} credits added
              </p>
            )}
            <div className="bg-gray-50 rounded-lg p-4 my-6">
              <div className="text-4xl font-bold text-gray-800">
                ${(paymentData.amount / 100).toFixed(2)}
              </div>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <div>Payment ID: {paymentData.id}</div>
              <div>
                Date: {new Date(paymentData.created).toLocaleDateString()}
              </div>
              <div className="capitalize">Status: {paymentData.status}</div>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        <Link href="/profile" className="btn-primary inline-block mt-6">
          View Profile
        </Link>
      </div>
    </main>
  );
}
