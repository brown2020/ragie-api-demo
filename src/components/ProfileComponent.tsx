"use client";

import Link from "next/link";
import useProfileStore from "@/zustand/useProfileStore";
import { useAuthStore } from "@/zustand/useAuthStore";
import Image from "next/image";

export default function ProfileComponent() {
  const profile = useProfileStore((state) => state.profile);
  const authEmail = useAuthStore((state) => state.authEmail);
  const authDisplayName = useAuthStore((state) => state.authDisplayName);
  const authPhotoUrl = useAuthStore((state) => state.authPhotoUrl);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {authPhotoUrl ? (
              <Image
                src={authPhotoUrl}
                width={64}
                height={64}
                alt={authDisplayName || "User"}
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-medium text-gray-500">
                {authDisplayName?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {authDisplayName || "User"}
            </h2>
            <p className="text-gray-500">{authEmail}</p>
          </div>
        </div>
      </div>

      {/* Credits Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Credits</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-800">
              {Math.round(profile.credits).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Available credits</p>
          </div>
          <Link href="/payment-attempt" className="btn-primary">
            Buy Credits
          </Link>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Account Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="text-gray-800">{profile.email || authEmail}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Display Name</label>
            <p className="text-gray-800">
              {profile.displayName || authDisplayName || "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
