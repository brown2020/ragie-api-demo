"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import { useEffect, useMemo } from "react";

function formatPaymentCreatedAt(createdAt: { toDate: () => Date } | null | undefined): string {
  if (!createdAt) return "N/A";
  try {
    return createdAt.toDate().toLocaleString("en-US");
  } catch {
    return "N/A";
  }
}

export default function PaymentsDisplay() {
  const uid = useAuthStore((state) => state.uid);
  const { payments, paymentsLoading, paymentsError, fetchPayments } =
    usePaymentsStore();

  useEffect(() => {
    if (uid) {
      fetchPayments();
    }
  }, [uid, fetchPayments]);

  const rows = useMemo(
    () =>
      payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        createdAtLabel: formatPaymentCreatedAt(payment.createdAt),
      })),
    [payments]
  );

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto gap-4">
      <div className="text-3xl font-bold">Payments</div>

      {paymentsLoading && <div>Loading payments...</div>}
      {paymentsError && (
        <div className="text-red-700" role="alert">
          Failed to load payments. Please try again later.
        </div>
      )}
      {!paymentsLoading && !paymentsError && rows.length === 0 && (
        <p className="text-gray-500">No payments yet.</p>
      )}
      {!paymentsLoading && !paymentsError && rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((payment) => (
            <div
              key={payment.id}
              className="border p-4 rounded-md bg-white shadow-md"
            >
              <div>ID: {payment.id}</div>
              <div>Amount: ${payment.amount / 100}</div>
              <div>Created At: {payment.createdAtLabel}</div>
              <div>Status: {payment.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
