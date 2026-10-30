export type OrderedDocument = {
  id: string;
  createdAtMillis: number | null;
};

/** Newest createdAt first. Equal timestamps break ties by id descending. */
export function compareDocumentsNewestFirst(a: OrderedDocument, b: OrderedDocument): number {
  const aTime = a.createdAtMillis ?? Number.NEGATIVE_INFINITY;
  const bTime = b.createdAtMillis ?? Number.NEGATIVE_INFINITY;
  if (aTime !== bTime) return bTime - aTime;
  if (a.id === b.id) return 0;
  return a.id < b.id ? 1 : -1;
}

export function sortDocumentsNewestFirst<T extends OrderedDocument>(documents: T[]): T[] {
  return [...documents].sort(compareDocumentsNewestFirst);
}
