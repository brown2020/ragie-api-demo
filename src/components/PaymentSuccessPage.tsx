"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import useProfileStore from "@/zustand/useProfileStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { validatePaymentIntent } from "@/actions/paymentActions";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

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
  } | null>(null);

  const addPayment = usePaymentsStore((state) => state.addPayment);
  const checkIfPaymentProcessed = usePaymentsStore(
    (state) => state.checkIfPaymentProcessed
  );
  const addCredits = useProfileStore((state) => state.addCredits);
  const uid = useAuthStore((state) => state.uid);

  useEffect(() => {
    if (!payment_intent) {
      setMessage("No payment intent found");
      setLoading(false);
      return;
    }

    if (!uid) {
      setMessage("Please sign in to view payment status");
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      try {
        const data = await validatePaymentIntent(payment_intent, uid);

        if (data.status === "succeeded") {
          // Check if payment is already processed
          const existingPayment = await checkIfPaymentProcessed(data.id);
          if (existingPayment) {
            setMessage("Payment has already been processed.");
            setPaymentData({
              id: existingPayment.id,
              amount: existingPayment.amount,
              created: existingPayment.createdAt?.toMillis() ?? 0,
              status: existingPayment.status,
            });
            setLoading(false);
            return;
          }

          // Add payment to store first
          await addPayment({
            id: data.id,
            amount: data.amount,
            status: data.status,
          });

          // Then add credits
          const creditsToAdd = data.amount + 1;
          try {
            await addCredits(creditsToAdd);
            toast.success(`${creditsToAdd.toLocaleString()} credits added!`);
          } catch (creditError) {
            console.error("Error adding credits:", creditError);
            toast.error("Payment recorded but credits not added. Please contact support.");
          }

          setMessage("Payment successful");
          setPaymentData({
            id: data.id,
            amount: data.amount,
            created: data.created * 1000,
            status: data.status,
          });
        } else {
          setMessage("Payment validation failed");
        }
      } catch (error) {
        console.error("Error handling payment success:", error);
        setMessage("Error validating payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [payment_intent, uid, addPayment, checkIfPaymentProcessed, addCredits]);

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
