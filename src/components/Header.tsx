"use client";

import { auth } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useFirebaseAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import AuthModal from "./AuthModal";
import Image from "next/image";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const { user, loading } = useFirebaseAuth();
  const authReady = useAuthStore((state) => state.authReady);
  const authPhotoUrl = useAuthStore((state) => state.authPhotoUrl);
  const authDisplayName = useAuthStore((state) => state.authDisplayName);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <div className="flex h-14 items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <Link href="/" className="font-medium text-xl">
          RAG Demo
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            About
          </Link>

          {loading ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          ) : user && authReady ? (
            <div className="flex gap-4 items-center">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {authPhotoUrl ? (
                    <Image
                      src={authPhotoUrl}
                      alt={authDisplayName || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {authDisplayName?.charAt(0).toUpperCase() || <User size={16} />}
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {authDisplayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}
