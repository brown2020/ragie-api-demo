import { getAdminDb } from "@/firebase/firebaseAdmin";
import {
  createOpenAISearchApi,
  documentMatchNames,
  duplicateCopies,
  fileIdsForDocument,
  isAppVectorStore,
  orphanCopies,
  readOpenAIApiKey,
  removeIndexedFile,
  savedOpenAIFileId,
  type IndexedCopy,
  type LiveDocument,
  type SearchApi,
} from "@/lib/openai-search";
import { indexedFileDocPath, vectorStoreDocPath } from "@/lib/searchPaths";

export async function loadLiveDocuments(uid: string, exceptId?: string): Promise<LiveDocument[]> {
  const db = getAdminDb();
  const snap = await db.collection(`users/${uid}/documents`).get();
  const docs: LiveDocument[] = [];
  for (const doc of snap.docs) {
    if (exceptId && doc.id === exceptId) continue;
    const name = typeof doc.get("name") === "string" ? doc.get("name") : "";
    const mapping = await db.doc(indexedFileDocPath(uid, doc.id)).get();
    docs.push({
      id: doc.id,
      names: documentMatchNames(name),
      fileId: savedOpenAIFileId(mapping.data()),
    });
  }
  return docs;
}

async function appStoreId(api: SearchApi, uid: string): Promise<string | null> {
  const db = getAdminDb();
  const saved = (await db.doc(vectorStoreDocPath(uid)).get()).get("vectorStoreId");
  if (typeof saved !== "string" || !saved.trim()) return null;
  const store = await api.retrieveVectorStore(saved);
  if (!isAppVectorStore(store, uid)) return null;
  return store?.id ?? null;
}

/** Detach and delete store files that do not belong to a current document. */
export async function cleanupOrphanFiles(
  uid: string,
  exceptId?: string
): Promise<{ removed: number; filenames: string[] }> {
  const apiKey = readOpenAIApiKey();
  if (!apiKey) return { removed: 0, filenames: [] };
  const api = createOpenAISearchApi(apiKey);
  const vectorStoreId = await appStoreId(api, uid);
  if (!vectorStoreId) return { removed: 0, filenames: [] };

  const files = await api.listStoreFiles(vectorStoreId);
  const live = await loadLiveDocuments(uid, exceptId);
  const doomed = uniqueCopies([...orphanCopies(files, live), ...duplicateCopies(files, live)]);
  const filenames: string[] = [];
  for (const file of doomed) {
    await removeIndexedFile(api, vectorStoreId, file.fileId);
    if (file.filename) filenames.push(file.filename);
    await deleteMappingForFile(uid, file.fileId);
  }
  return { removed: doomed.length, filenames };
}

function uniqueCopies(files: IndexedCopy[]): IndexedCopy[] {
  const seen = new Set<string>();
  const unique: IndexedCopy[] = [];
  for (const file of files) {
    if (seen.has(file.fileId)) continue;
    seen.add(file.fileId);
    unique.push(file);
  }
  return unique;
}

async function deleteMappingForFile(uid: string, fileId: string): Promise<void> {
  const db = getAdminDb();
  const snap = await db.collection(`users/${uid}/searchFiles`).get();
  for (const doc of snap.docs) {
    if (doc.get("openaiFileId") === fileId) {
      await doc.ref.delete().catch(() => undefined);
    }
  }
}

/** Remove every store copy of one document, then any other orphans in that app store. */
export async function removeDocumentFromSearch(
  uid: string,
  document: { id: string; name: string }
): Promise<{ removed: number; filenames: string[] }> {
  const apiKey = readOpenAIApiKey();
  if (!apiKey) return { removed: 0, filenames: [] };
  const api = createOpenAISearchApi(apiKey);
  const vectorStoreId = await appStoreId(api, uid);
  const db = getAdminDb();
  const mapping = await db.doc(indexedFileDocPath(uid, document.id)).get();
  const savedFileId = savedOpenAIFileId(mapping.data());

  if (!vectorStoreId) {
    if (savedFileId) await removeIndexedFile(api, null, savedFileId);
    await mapping.ref.delete().catch(() => undefined);
    return { removed: savedFileId ? 1 : 0, filenames: documentMatchNames(document.name) };
  }

  const files = await api.listStoreFiles(vectorStoreId);
  const targeted = new Set(
    fileIdsForDocument(files, {
      documentId: document.id,
      names: documentMatchNames(document.name),
      savedFileId,
    })
  );
  if (savedFileId) targeted.add(savedFileId);
  const remaining = await loadLiveDocuments(uid, document.id);
  for (const orphan of orphanCopies(files, remaining)) targeted.add(orphan.fileId);
  for (const extra of duplicateCopies(files, remaining)) targeted.add(extra.fileId);

  const filenames: string[] = [];
  const byId = new Map(files.map((file) => [file.fileId, file]));
  let removed = 0;
  for (const fileId of targeted) {
    const copy: IndexedCopy | undefined = byId.get(fileId);
    if (copy?.purpose && copy.purpose !== "assistants") continue;
    await removeIndexedFile(api, vectorStoreId, fileId);
    if (copy?.filename) filenames.push(copy.filename);
    await deleteMappingForFile(uid, fileId);
    removed += 1;
  }
  await mapping.ref.delete().catch(() => undefined);
  return { removed, filenames };
}
