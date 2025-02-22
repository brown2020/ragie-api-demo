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

  // Function to handle file upload to Firebase Storage
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const file = acceptedFiles[0];
    const storageRef = ref(storage, `documents/${file.name}`);
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

          const docRef = await addDoc(collection(db, "documents"), {
            name: file.name,
            url: downloadURL,
            uploadedToRagie: false,
            createdAt: new Date(),
          });

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
    try {
      const querySnapshot = await getDocs(collection(db, "documents"));
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
    setRagieUploading((prev) => ({ ...prev, [document.id]: true }));

    try {
      const response = await uploadToRagie(document.url, document.name);
      console.log("Uploaded to Ragie:", response);

      await updateDoc(doc(db, "documents", document.id), {
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

  // Fetch documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

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
            : "border-gray-300 bg-white"
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
          className={`px-6 py-2 mt-4 text-white font-semibold rounded-md shadow-sm transition-colors ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }`}
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
                  className="flex items-center space-x-2 text-blue-500 hover:text-blue-700"
                >
                  <UploadIcon className="w-5 h-5" />
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
