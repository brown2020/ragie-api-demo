"use client";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseClient";
import { UploadIcon } from "lucide-react";
import { uploadToRagie } from "@/actions/uploadToRagie"; // Import the server action
import { useAuthStore } from "@/zustand/useAuthStore"; // Import auth store

// Define the type for document metadata
interface DocumentData {
  id: string;
  name: string;
  url: string;
  uploadedToRagie: boolean;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [ragieUploading, setRagieUploading] = useState<Record<string, boolean>>(
    {}
  );
  const uid = useAuthStore((state) => state.uid); // Get current user ID

  // Function to handle file upload to Firebase Storage
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const uid = useAuthStore.getState().uid;
    if (!uid) {
      console.error("User not authenticated");
      return;
    }

    setUploading(true);
    const file = acceptedFiles[0];
    // Store files in user-specific folder
    const storageRef = ref(storage, `users/${uid}/documents/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          // Store document metadata in user-specific collection
          const docRef = await addDoc(
            collection(db, `users/${uid}/documents`),
            {
              name: file.name,
              url: downloadURL,
              uploadedToRagie: false,
              createdAt: new Date(),
            }
          );

          setDocuments((prev) => [
            ...prev,
            {
              id: docRef.id,
              name: file.name,
              url: downloadURL,
              uploadedToRagie: false,
            },
          ]);
        } catch (error) {
          console.error("Error saving document metadata: ", error);
        } finally {
          setUploading(false);
        }
      }
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // Disable automatic click handling by Dropzone
  });

  // Function to load all documents from Firestore
  const loadDocuments = async () => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      console.error("User not authenticated");
      return;
    }

    try {
      // Get documents from user-specific collection
      const querySnapshot = await getDocs(
        collection(db, `users/${uid}/documents`)
      );
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DocumentData[];
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents: ", error);
    }
  };

  // Function to upload a document to Ragie using server action
  const handleUploadToRagie = async (document: DocumentData) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      console.error("User not authenticated");
      return;
    }

    setRagieUploading((prev) => ({ ...prev, [document.id]: true }));

    try {
      const response = await uploadToRagie(document.url, document.name);
      console.log("Uploaded to Ragie:", response);

      // Update document in user-specific collection
      await updateDoc(doc(db, `users/${uid}/documents`, document.id), {
        uploadedToRagie: true,
      });
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id ? { ...doc, uploadedToRagie: true } : doc
        )
      );
    } catch (error) {
      console.error("Error uploading to Ragie: ", error);
    } finally {
      setRagieUploading((prev) => ({ ...prev, [document.id]: false }));
    }
  };

  // Fetch documents on component mount or when uid changes
  useEffect(() => {
    if (uid) {
      loadDocuments();
    }
  }, [uid]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        File Management
      </h1>

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 flex justify-center items-center cursor-pointer transition duration-200 ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-400">Drop the files here ...</p>
        ) : (
          <p className="text-gray-500">
            {`Drag 'n' drop some files here, or click the button below to select
            files`}
          </p>
        )}
      </div>

      {/* Upload Button */}
      <div className="mt-4 text-center">
        <button
          onClick={open} // Triggers the file input to open
          disabled={uploading}
          className={`btn-primary mt-3 ${uploading ? "btn-loading" : ""}`}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      {/* Uploaded Documents List */}
      <h2 className="text-xl font-semibold text-gray-800 mt-8">
        Uploaded Documents
      </h2>
      <ul className="mt-4 space-y-2">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg shadow-xs bg-white"
          >
            <div className="flex items-center space-x-4">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {doc.name}
              </a>
              {doc.uploadedToRagie ? (
                <span className="text-sm text-green-500">
                  Uploaded to Ragie
                </span>
              ) : (
                <button
                  onClick={() => handleUploadToRagie(doc)}
                  disabled={ragieUploading[doc.id]}
                  className={`flex items-center space-x-2 text-blue-600 px-3 py-1 rounded border border-blue-600 cursor-pointer hover:bg-blue-50 hover:shadow-sm hover:translate-y-[-1px] transition-all duration-200 ${
                    ragieUploading[doc.id]
                      ? "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
                      : ""
                  }`}
                >
                  <UploadIcon className="w-4 h-4" />
                  <span>
                    {ragieUploading[doc.id]
                      ? "Uploading..."
                      : "Upload to Ragie"}
                  </span>
                </button>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
