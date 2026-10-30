"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  db,
  storage,
  hasClientConfig,
  getFirebaseIdToken,
} from "@/firebase/firebaseClient";
import { Trash2, UploadIcon } from "lucide-react";
import { deleteDocument } from "@/actions/deleteDocument";
import { pollIndex, postAction } from "@/lib/actionResponse";
import { compareDocumentsNewestFirst } from "@/lib/documentOrder";
import { INPUT_LIMITS } from "@/lib/inputLimits";
import {
  contentTypeForFileName,
  isSafeStorageUrl,
  sanitizeFileName,
} from "@/lib/storageAccess";
import { useAuthStore } from "@/zustand/useAuthStore";
import toast from "react-hot-toast";

interface DocumentData {
  id: string;
  name: string;
  url: string;
  storagePath?: string;
  uploadedToRagie: boolean;
  createdAt?: Timestamp;
  createdAtLabel?: string;
}

function byNewestFirst(a: DocumentData, b: DocumentData): number {
  return compareDocumentsNewestFirst(
    { id: a.id, createdAtMillis: a.createdAt?.toMillis?.() ?? null },
    { id: b.id, createdAtMillis: b.createdAt?.toMillis?.() ?? null }
  );
}

function formatDocDate(createdAt?: Timestamp): string {
  if (!createdAt) return "Pending";
  try {
    return createdAt.toDate().toLocaleDateString("en-US");
  } catch {
    return "Pending";
  }
}

export default function FileManagement() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [indexing, setIndexing] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const uid = useAuthStore((state) => state.uid);
  const uploadTaskRef = useRef<UploadTask | null>(null);

  useEffect(() => {
    return () => {
      try {
        uploadTaskRef.current?.cancel();
      } catch {
        // already finished
      }
      uploadTaskRef.current = null;
    };
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (!uid || !hasClientConfig || !storage || !db) {
        toast.error("Please sign in to upload files");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;
      const contentType = contentTypeForFileName(file.name, file.type);
      if (!contentType) {
        toast.error("Upload a PDF, text, CSV, or Office document.");
        return;
      }
      if (file.size <= 0 || file.size > INPUT_LIMITS.maxUploadBytes) {
        toast.error("File must be 32 MB or smaller.");
        return;
      }

      setUploading(true);
      const displayName = file.name.trim().slice(0, 255) || "document";
      const storagePath = `users/${uid}/documents/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType,
        contentDisposition: `attachment; filename="${sanitizeFileName(file.name)}"`,
      });
      uploadTaskRef.current = uploadTask;

      try {
        // UploadTask is thenable — await avoids .on() subscription cleanup issues
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const createdAt = Timestamp.now();

        const docRef = await addDoc(collection(db, `users/${uid}/documents`), {
          name: displayName,
          url: downloadURL,
          storagePath,
          uploadedToRagie: false,
          createdAt,
        });

        setDocuments((prev) =>
          [
            ...prev,
            {
              id: docRef.id,
              name: displayName,
              url: downloadURL,
              storagePath,
              uploadedToRagie: false,
              createdAt,
              createdAtLabel: formatDocDate(createdAt),
            },
          ].sort(byNewestFirst)
        );
        toast.success("File uploaded successfully");
      } catch {
        try {
          await deleteObject(storageRef);
        } catch {
          // Best-effort cleanup when metadata save fails or upload cancelled
        }
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        uploadTaskRef.current = null;
      }
    },
    [uid]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    multiple: false,
    maxSize: INPUT_LIMITS.maxUploadBytes,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "text/csv": [".csv"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    },
  });

  const loadDocuments = useCallback(async () => {
    if (!uid || !hasClientConfig || !db) return;

    try {
      const querySnapshot = await getDocs(
        collection(db, `users/${uid}/documents`)
      );
      const docs = querySnapshot.docs
        .map((d) => {
          const data = d.data() as Omit<DocumentData, "id" | "createdAtLabel">;
          return {
            id: d.id,
            ...data,
            createdAtLabel: formatDocDate(data.createdAt),
          };
        })
        .sort(byNewestFirst);
      setDocuments(docs);
    } catch {
      toast.error("Failed to load documents");
    }
  }, [uid]);

  const handleIndex = async (document: DocumentData) => {
    if (!uid) {
      toast.error("Please sign in to index files");
      return;
    }

    setIndexing((prev) => ({ ...prev, [document.id]: true }));

    const markIndexed = async (indexed: boolean) => {
      if (hasClientConfig && db) {
        await updateDoc(doc(db, `users/${uid}/documents`, document.id), {
          uploadedToRagie: indexed,
        });
      }
      setDocuments((prev) =>
        prev.map((item) =>
          item.id === document.id ? { ...item, uploadedToRagie: indexed } : item
        )
      );
    };

    try {
      const idToken = await getFirebaseIdToken();
      const fileRef = document.storagePath || document.url;
      const started = await postAction<{ fileId: string; status: "in_progress" | "completed" }>(
        "/api/search/index",
        { fileRef, fileName: document.name, documentId: document.id, idToken }
      );
      if (!started.ok) {
        if (started.error.code !== "UNEXPECTED_RESPONSE" && started.error.code !== "NETWORK_ERROR") {
          await markIndexed(false);
        }
        toast.error(started.error.message);
        return;
      }

      const finished = await pollIndex(document.id, idToken, started.data.status);
      if (!finished.ok) {
        if (finished.error.code !== "UNEXPECTED_RESPONSE" && finished.error.code !== "NETWORK_ERROR") {
          await markIndexed(false);
        }
        toast.error(finished.error.message);
        return;
      }

      await markIndexed(true);
      toast.success("Document indexed for search");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error indexing the document.");
    } finally {
      setIndexing((prev) => ({ ...prev, [document.id]: false }));
    }
  };

  const handleDelete = async (document: DocumentData) => {
    if (!uid) {
      toast.error("Please sign in to delete files");
      return;
    }

    setDeleting((prev) => ({ ...prev, [document.id]: true }));
    try {
      const idToken = await getFirebaseIdToken();
      const result = await deleteDocument(document.id, idToken);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      setDocuments((prev) => prev.filter((item) => item.id !== document.id));
      toast.success("Document deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting the document.");
    } finally {
      setDeleting((prev) => ({ ...prev, [document.id]: false }));
    }
  };

  useEffect(() => {
    if (!uid) return;
    const timeoutId = window.setTimeout(() => {
      void loadDocuments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [uid, loadDocuments]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        File Management
      </h1>

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

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={open}
          disabled={uploading || !uid}
          className={`btn-primary mt-3 ${uploading ? "btn-loading" : ""}`}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

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
                {isSafeStorageUrl(document.url) ? (
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {document.name}
                  </a>
                ) : (
                  <span className="text-gray-800">{document.name}</span>
                )}
                {document.uploadedToRagie && (
                  <span className="text-sm text-green-700">Indexed</span>
                )}
                <button
                  type="button"
                  onClick={() => handleIndex(document)}
                  disabled={indexing[document.id] || deleting[document.id]}
                  className={`flex items-center space-x-2 text-blue-700 px-3 py-1 rounded border border-blue-700 cursor-pointer hover:bg-blue-50 hover:shadow-sm transition-all duration-200 ${
                    indexing[document.id] ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <UploadIcon className="w-4 h-4" />
                  <span>
                    {indexing[document.id]
                      ? "Indexing..."
                      : document.uploadedToRagie
                        ? "Re-index"
                        : "Index for search"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(document)}
                  disabled={deleting[document.id] || indexing[document.id]}
                  className="flex items-center space-x-2 text-red-700 px-3 py-1 rounded border border-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting[document.id] ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {document.createdAtLabel ?? "Pending"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
