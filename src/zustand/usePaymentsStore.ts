import { create } from "zustand";
import {
  collection,
  query,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import { db } from "@/firebase/firebaseClient";

export type PaymentType = {
  id: string;
  amount: number;
  createdAt: Timestamp | null;
  status: string;
};

interface PaymentsStoreState {
  payments: PaymentType[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  fetchPayments: () => Promise<void>;
}

export const usePaymentsStore = create<PaymentsStoreState>((set) => ({
  payments: [],
  paymentsLoading: false,
  paymentsError: null,

  fetchPayments: async () => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      set({ paymentsError: "User not authenticated", paymentsLoading: false });
      return;
    }

    set({ paymentsLoading: true, paymentsError: null });

    try {
      const q = query(
        collection(db, "users", uid, "payments"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const payments: PaymentType[] = querySnapshot.docs.map((doc) => ({
        id: doc.data().id || doc.id,
        amount: doc.data().amount,
        createdAt: doc.data().createdAt || null,
        status: doc.data().status,
      }));

      set({ payments, paymentsLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      set({ paymentsError: errorMessage, paymentsLoading: false });
    }
  },
}));
