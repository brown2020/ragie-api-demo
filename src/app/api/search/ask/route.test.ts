import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("ask route", () => {
  it("returns JSON when the body is not JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/ask", {
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

  it("returns a JSON auth error for an empty token", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/ask", {
        method: "POST",
        body: JSON.stringify({ query: "What is this?", idToken: "" }),
        headers: { "content-type": "application/json" },
      })
    );
    expect(response.headers.get("content-type")).toMatch(/json/);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.status).toBe(401);
  });
});
