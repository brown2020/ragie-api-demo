"use client";

import { Suspense } from "react";
import PaymentSuccessPage from "@/components/PaymentSuccessPage";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const payment_intent = searchParams.get("payment_intent") || "";

  return <PaymentSuccessPage payment_intent={payment_intent} />;
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
