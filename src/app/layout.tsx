import type { Metadata } from "next";

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
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
    <html lang="en" className="h-full">
      <body className="flex flex-col h-full">
        <AuthProvider>
          <Header />
          <main className="flex flex-col flex-1 bg-slate-100 overflow-y-auto">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
