import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("index route", () => {
  it("returns JSON when the body is not JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/index", {
        method: "POST",
        body: "<html>",
        headers: { "content-type": "text/html" },
      })
    );
    expect(response.headers.get("content-type")).toMatch(/json/);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("INVALID_JSON");
  });

  it("returns JSON when required fields are missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/index", {
        method: "POST",
        body: JSON.stringify({ fileName: "notes.txt" }),
        headers: { "content-type": "application/json" },
      })
    );
    expect(response.headers.get("content-type")).toMatch(/json/);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.status).toBe(400);
    expect(body.error.code).toBe("INVALID_JSON");
  });

  it("returns a JSON auth error for an empty token", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/index", {
        method: "POST",
        body: JSON.stringify({
          fileRef: "users/uid/documents/notes.txt",
          fileName: "notes.txt",
          documentId: "doc-1",
          idToken: "",
        }),
        headers: { "content-type": "application/json" },
      })
    );
    expect(response.headers.get("content-type")).toMatch(/json/);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});
