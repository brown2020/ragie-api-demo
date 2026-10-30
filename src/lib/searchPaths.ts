/**
 * Firestore document paths need an even number of segments
 * (collection/doc/collection/doc). `users/{uid}/search/files/{documentId}`
 * has five, so `doc()` throws before any write or security rule runs.
 * The vector store id stays at `users/{uid}/search/store` (four segments).
 * File ids live at `users/{uid}/searchFiles/{documentId}` (four segments).
 * Both are outside the client-writable matches, so only the Admin SDK can write them.
 */

export function vectorStoreDocPath(uid: string): string {
  return `users/${uid}/search/store`;
}

export function indexedFileDocPath(uid: string, documentId: string): string {
  return `users/${uid}/searchFiles/${documentId}`;
}

export function isEvenDocumentPath(path: string): boolean {
  const segments = path.split("/").filter((part) => part.length > 0);
  return segments.length > 0 && segments.length % 2 === 0;
}
