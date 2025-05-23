import type { Metadata } from "next";

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "RAG Demo",
  description: "RAG Demo: A simple demo for a RAG as a service API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" className="h-full">
        <body className="flex flex-col h-full">
          <Header />
          <div className="flex flex-col h-full flex-1 bg-slate-200 overflow-y-auto p-4">
            {children}
          </div>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
