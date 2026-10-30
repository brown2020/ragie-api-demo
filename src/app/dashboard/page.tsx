import Dashboard from "@/components/Dashboard";

// Vercel defaults this page to 15 seconds. A cold OpenAI call exceeded that,
// and the platform returned a non-RSC page ("An unexpected response was received
// from the server."). Indexing no longer waits for vector-store processing;
// Ask still needs the longer limit.
export const maxDuration = 60;

export default function DashboardPage() {
  return <Dashboard />;
}
