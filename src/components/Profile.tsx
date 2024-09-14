"use client";

import ProfileComponent from "./ProfileComponent";
import AuthDataDisplay from "./AuthDataDisplay";
import PaymentsDisplay from "./PaymentsDisplay";

export default function Profile() {
  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto gap-4">
      <div className="text-3xl font-bold">User Profile</div>
      <AuthDataDisplay />
      <ProfileComponent />
      <PaymentsDisplay />
    </div>
  );
}
