"use client";

import Link from "next/link";
import useProfileStore, { ProfileType } from "@/zustand/useProfileStore";
import { useEffect, useState } from "react";

// Define the API key field types and configuration
type ApiKeyField = {
  id: keyof ProfileType;
  label: string;
  placeholder: string;
};

// Configuration for the API key fields
const apiKeyFields: ApiKeyField[] = [
  {
    id: "ragie_api_key",
    label: "Ragie API Key",
    placeholder: "Enter your Ragie API Key",
  },
  {
    id: "openai_api_key",
    label: "OpenAI API Key",
    placeholder: "Enter your OpenAI API Key",
  },
  {
    id: "anthropic_api_key",
    label: "Anthropic API Key",
    placeholder: "Enter your Anthropic API Key",
  },
  {
    id: "google_gen_ai_api_key",
    label: "Google Generative AI API Key",
    placeholder: "Enter your Google Generative AI API Key",
  },
  {
    id: "mistral_api_key",
    label: "Mistral API Key",
    placeholder: "Enter your Mistral API Key",
  },
  {
    id: "fireworks_api_key",
    label: "Fireworks API Key",
    placeholder: "Enter your Fireworks API Key",
  },
];

// Reusable input component for API keys
const ApiKeyInput = ({
  field,
  value,
  onChange,
}: {
  field: ApiKeyField;
  value: string;
  onChange: (id: keyof ProfileType, value: string) => void;
}) => (
  <div className="flex flex-col">
    <label htmlFor={field.id} className="text-sm font-light">
      {field.label}:
    </label>
    <input
      type="text"
      id={field.id}
      value={value}
      onChange={(e) => onChange(field.id, e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-3 h-10"
      placeholder={field.placeholder}
    />
  </div>
);

export default function ProfileComponent() {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  // State object to handle all API keys
  const [apiKeys, setApiKeys] = useState<Partial<ProfileType>>(() => ({
    ragie_api_key: profile.ragie_api_key,
    openai_api_key: profile.openai_api_key,
    anthropic_api_key: profile.anthropic_api_key,
    google_gen_ai_api_key: profile.google_gen_ai_api_key,
    mistral_api_key: profile.mistral_api_key,
    fireworks_api_key: profile.fireworks_api_key,
  }));

  // Sync state variables with profile data
  useEffect(() => {
    setApiKeys({
      ragie_api_key: profile.ragie_api_key,
      openai_api_key: profile.openai_api_key,
      anthropic_api_key: profile.anthropic_api_key,
      google_gen_ai_api_key: profile.google_gen_ai_api_key,
      mistral_api_key: profile.mistral_api_key,
      fireworks_api_key: profile.fireworks_api_key,
    });
  }, [profile]);

  const handleApiKeyChange = async () => {
    const hasChanges = Object.entries(apiKeys).some(
      ([key, value]) => value !== profile[key as keyof ProfileType]
    );

    if (hasChanges) {
      try {
        await updateProfile(apiKeys);
        console.log("API keys updated successfully!");
      } catch (error) {
        console.error("Error updating API keys:", error);
      }
    }
  };

  const handleChange = (key: keyof ProfileType, value: string) => {
    setApiKeys((prevState) => ({ ...prevState, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <div className="flex gap-2 w-full items-center">
          <div className="flex-1">
            Credits Available: {Math.round(profile.credits)}
          </div>
          <Link
            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 flex-1 text-center"
            href={"/payment-attempt"}
          >
            Buy 10,000 Credits
          </Link>
        </div>
      </div>
      <div className="flex flex-col px-5 py-3 gap-3 border border-gray-500 rounded-md">
        {apiKeyFields.map((field) => (
          <ApiKeyInput
            key={field.id}
            field={field}
            value={(apiKeys[field.id] as string) || ""}
            onChange={handleChange}
          />
        ))}

        <button
          onClick={handleApiKeyChange}
          disabled={
            !Object.entries(apiKeys).some(
              ([key, value]) => value !== profile[key as keyof ProfileType]
            )
          }
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 disabled:opacity-50"
        >
          Update API Keys
        </button>
      </div>
    </div>
  );
}
