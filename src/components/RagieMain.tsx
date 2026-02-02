"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { useFirebaseAuth } from "./AuthProvider";
import Image from "next/image";
import Link from "next/link";

export default function RagieMain() {
  const { user, loading } = useFirebaseAuth();
  const authReady = useAuthStore((state) => state.authReady);
  const photoUrl = useAuthStore((state) => state.authPhotoUrl);
  const fullName = useAuthStore((state) => state.authDisplayName);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-pulse flex flex-col items-center gap-4 bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="w-32 h-4 bg-gray-200 rounded" />
          <div className="w-48 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col gap-5 bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <div className="text-2xl font-bold text-center">RAG Demo</div>

          {user && authReady ? (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      width={80}
                      height={80}
                      alt={fullName || "User"}
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-medium text-gray-500">
                      {fullName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="text-lg font-medium">{fullName || "User"}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/dashboard"
                  className="btn-primary text-center"
                >
                  Go to Dashboard
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-lg font-medium text-gray-700 mb-2 text-center">
                Welcome to the RAG Demo!
              </div>
              <div className="text-sm text-gray-600 text-center mb-4">
                This demo showcases the capabilities of a RAG as a service API,
                allowing you to interact with various features and explore the
                potential of integrating RAG into your projects.
              </div>
              <p className="text-sm text-gray-500 text-center">
                Sign in to start exploring the features.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
