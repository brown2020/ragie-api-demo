// app/components/Dashboard.tsx
"use client";
import FileManagement from "./FileManagement"; // Import the FileManagement component
import GenerateContent from "./GenerateContent";
import QueryRetrieval from "./QueryRetrieval"; // Import the QueryRetrieval component

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto py-6 p-4 flex-1 gap-5">
      <FileManagement />
      <QueryRetrieval />
      <GenerateContent />
    </div>
  );
}
