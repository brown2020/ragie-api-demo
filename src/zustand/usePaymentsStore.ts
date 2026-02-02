import { create } from "zustand";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
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
  addPayment: (payment: Omit<PaymentType, "createdAt">) => Promise<void>;
  checkIfPaymentProcessed: (paymentId: string) => Promise<PaymentType | null>;
}

// Safe sort function that handles null createdAt values
const sortPaymentsByDate = (payments: PaymentType[]): PaymentType[] => {
  return [...payments].sort((a, b) => {
    const timeA = a.createdAt?.toMillis() ?? 0;
    const timeB = b.createdAt?.toMillis() ?? 0;
    return timeB - timeA;
  });
};

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
      console.error("Error fetching payments:", errorMessage);
      set({ paymentsError: errorMessage, paymentsLoading: false });
    }
  },

  addPayment: async (payment) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      toast.error("User not authenticated");
      return;
    }

    set({ paymentsLoading: true });

    try {
      // Check if payment already exists
      const q = query(
        collection(db, "users", uid, "payments"),
        where("id", "==", payment.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        set({ paymentsLoading: false });
        return; // Payment already exists, silently return
      }

      const createdAt = Timestamp.now();
      await addDoc(collection(db, "users", uid, "payments"), {
        id: payment.id,
        amount: payment.amount,
        createdAt,
        status: payment.status,
      });

      const newPayment: PaymentType = {
        id: payment.id,
        amount: payment.amount,
        createdAt,
        status: payment.status,
      };

      set((state) => ({
        payments: sortPaymentsByDate([...state.payments, newPayment]),
        paymentsLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error adding payment:", errorMessage);
      set({ paymentsError: errorMessage, paymentsLoading: false });
      throw error;
    }
  },

  checkIfPaymentProcessed: async (paymentId) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return null;

    try {
      const paymentsRef = collection(db, "users", uid, "payments");
      const q = query(
        paymentsRef,
        where("id", "==", paymentId),
        where("status", "==", "succeeded")
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          id: data.id,
          amount: data.amount,
          createdAt: data.createdAt || null,
          status: data.status,
        } as PaymentType;
      }

      return null;
    } catch (error) {
      console.error("Error checking payment:", error);
      return null;
    }
  },
}));
