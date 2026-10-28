import { describe, expect, it } from "vitest";
import {
  assertUserDocumentPath,
  contentTypeForFileName,
  isAllowedDocumentType,
  isSafeStorageUrl,
  sanitizeFileName,
  storagePathFromReference,
} from "./storageAccess";

const UID = "user123";
const BUCKET = "demo.appspot.com";

describe("storage reference guard", () => {
  it("accepts only this user's document object path", () => {
    expect(assertUserDocumentPath(`users/${UID}/documents/file.pdf`, UID)).toBe(
      `users/${UID}/documents/file.pdf`
    );
    expect(() => assertUserDocumentPath(`users/other/documents/file.pdf`, UID)).toThrow(
      /invalid storage path/i
    );
    expect(() =>
      assertUserDocumentPath(`users/${UID}/documents/../../other/file.pdf`, UID)
    ).toThrow(/invalid storage path/i);
    expect(() => assertUserDocumentPath(`users/${UID}/documents/nested/file.pdf`, UID)).toThrow(
      /invalid storage path/i
    );
  });

  it("parses a Firebase download URL and never accepts other hosts", () => {
    const objectPath = `users/${UID}/documents/notes.txt`;
    const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(objectPath)}?alt=media&token=abc`;
    expect(storagePathFromReference(url, UID, BUCKET)).toBe(objectPath);

    expect(() =>
      storagePathFromReference("http://169.254.169.254/latest/meta-data/", UID, BUCKET)
    ).toThrow(/invalid storage path/i);
    expect(() =>
      storagePathFromReference("https://example.com/file.txt", UID, BUCKET)
    ).toThrow(/invalid storage path/i);
    expect(() =>
      storagePathFromReference(
        `https://firebasestorage.googleapis.com/v0/b/other-bucket/o/${encodeURIComponent(objectPath)}`,
        UID,
        BUCKET
      )
    ).toThrow(/invalid storage path/i);
    expect(() =>
      storagePathFromReference(
        `https://evil.com/v0/b/${BUCKET}/o/${encodeURIComponent(objectPath)}`,
        UID,
        BUCKET
      )
    ).toThrow(/invalid storage path/i);
  });

  it("allows document links only on Firebase Storage hosts", () => {
    expect(
      isSafeStorageUrl(
        "https://firebasestorage.googleapis.com/v0/b/bucket/o/file?alt=media&token=1"
      )
    ).toBe(true);
    expect(isSafeStorageUrl("https://cdn.firebasestorage.app/object")).toBe(true);
    expect(isSafeStorageUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeStorageUrl("http://firebasestorage.googleapis.com/file")).toBe(false);
    expect(isSafeStorageUrl("https://evil.com/?next=https://firebasestorage.googleapis.com")).toBe(
      false
    );
  });

  it("allowlists document types and sanitizes names", () => {
    expect(isAllowedDocumentType("text/plain; charset=utf-8")).toBe(true);
    expect(isAllowedDocumentType("text/html")).toBe(false);
    expect(isAllowedDocumentType("image/svg+xml")).toBe(false);
    expect(contentTypeForFileName("notes.md", "")).toBe("text/markdown");
    expect(contentTypeForFileName("page.html", "text/html")).toBe(null);
    expect(sanitizeFileName("../../weird name.pdf")).toBe("weird_name.pdf");
  });
});
