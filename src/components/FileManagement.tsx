"use client";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseClient";
import { UploadIcon } from "lucide-react";
import { uploadToRagie } from "@/actions/uploadToRagie";
import { useAuthStore } from "@/zustand/useAuthStore";
import toast from "react-hot-toast";

interface DocumentData {
  id: string;
  name: string;
  url: string;
  uploadedToRagie: boolean;
  createdAt?: Timestamp;
}

export default function FileManagement() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [ragieUploading, setRagieUploading] = useState<Record<string, boolean>>(
    {}
  );
  const uid = useAuthStore((state) => state.uid);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (!uid) {
        toast.error("Please sign in to upload files");
        return;
      }

      setUploading(true);
      const file = acceptedFiles[0];
      const storageRef = ref(storage, `users/${uid}/documents/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        async (error) => {
          console.error("Upload failed", error);
          toast.error("Upload failed. Please try again.");
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            const docRef = await addDoc(
              collection(db, `users/${uid}/documents`),
              {
                name: file.name,
                url: downloadURL,
                uploadedToRagie: false,
                createdAt: Timestamp.now(),
              }
            );

            setDocuments((prev) => [
              ...prev,
              {
                id: docRef.id,
                name: file.name,
                url: downloadURL,
                uploadedToRagie: false,
                createdAt: Timestamp.now(),
              },
            ]);
            toast.success("File uploaded successfully");
          } catch (error) {
            console.error("Error saving document metadata: ", error);
            // Rollback: delete the uploaded file if metadata save fails
            try {
              await deleteObject(storageRef);
            } catch (deleteError) {
              console.error("Error cleaning up orphaned file:", deleteError);
            }
            toast.error("Failed to save file. Please try again.");
          } finally {
            setUploading(false);
          }
        }
      );
    },
    [uid]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  const loadDocuments = useCallback(async () => {
    if (!uid) return;

    try {
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
      toast.error("Failed to load documents");
    }
  }, [uid]);

  const handleUploadToRagie = async (document: DocumentData) => {
    if (!uid) {
      toast.error("Please sign in to upload to Ragie");
      return;
    }

    setRagieUploading((prev) => ({ ...prev, [document.id]: true }));

    try {
      const result = await uploadToRagie(document.url, document.name, uid);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      await updateDoc(doc(db, `users/${uid}/documents`, document.id), {
        uploadedToRagie: true,
      });
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === document.id ? { ...d, uploadedToRagie: true } : d
        )
      );
      toast.success("Uploaded to Ragie successfully");
    } catch (error) {
      console.error("Error uploading to Ragie: ", error);
      toast.error(
        error instanceof Error ? error.message : "Error uploading to Ragie."
      );
    } finally {
      setRagieUploading((prev) => ({ ...prev, [document.id]: false }));
    }
  };

  useEffect(() => {
    if (uid) {
      loadDocuments();
    }
  }, [uid, loadDocuments]);

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
            {`Drag 'n' drop some files here, or click the button below to select files`}
          </p>
        )}
      </div>

      {/* Upload Button */}
      <div className="mt-4 text-center">
        <button
          onClick={open}
          disabled={uploading || !uid}
          className={`btn-primary mt-3 ${uploading ? "btn-loading" : ""}`}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      {/* Uploaded Documents List */}
      <h2 className="text-xl font-semibold text-gray-800 mt-8">
        Uploaded Documents
      </h2>
      {documents.length === 0 ? (
        <p className="text-gray-500 mt-4">No documents uploaded yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white"
            >
              <div className="flex items-center space-x-4">
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {document.name}
                </a>
                {document.uploadedToRagie ? (
                  <span className="text-sm text-green-500">
                    Uploaded to Ragie
                  </span>
                ) : (
                  <button
                    onClick={() => handleUploadToRagie(document)}
                    disabled={ragieUploading[document.id]}
                    className={`flex items-center space-x-2 text-blue-600 px-3 py-1 rounded border border-blue-600 cursor-pointer hover:bg-blue-50 hover:shadow-sm transition-all duration-200 ${
                      ragieUploading[document.id]
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <UploadIcon className="w-4 h-4" />
                    <span>
                      {ragieUploading[document.id]
                        ? "Uploading..."
                        : "Upload to Ragie"}
                    </span>
                  </button>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {document.createdAt?.toDate().toLocaleDateString() ??
                  new Date().toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
