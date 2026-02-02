import { Timestamp } from "firebase/firestore";

// Profile types
export interface ProfileType {
  email: string;
  contactEmail: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
  credits: number;
}

// Payment types
export interface PaymentType {
  id: string;
  amount: number;
  createdAt: Timestamp | null;
  status: string;
}

// Document types
export interface DocumentData {
  id: string;
  name: string;
  url: string;
  uploadedToRagie: boolean;
  createdAt?: Timestamp;
}

// Ragie types
export interface Chunk {
  text: string;
  score: number;
}

export interface RetrievalResponse {
  scored_chunks: Chunk[];
}

// API Result types
export interface RagieActionError {
  status: number;
  code: string;
  message: string;
  detail?: string;
}

export type RagieActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: RagieActionError };

// Auth types
export interface AuthState {
  uid: string;
  firebaseUid: string;
  authEmail: string;
  authDisplayName: string;
  authPhotoUrl: string;
  authEmailVerified: boolean;
  authReady: boolean;
  authPending: boolean;
  isAdmin: boolean;
  isAllowed: boolean;
  isInvited: boolean;
  lastSignIn: Timestamp | null;
  premium: boolean;
  credits: number;
}
