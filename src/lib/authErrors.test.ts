import { describe, expect, it } from "vitest";
import { mapAuthError } from "./authErrors";

describe("mapAuthError", () => {
  it("maps invalid-credential", () => {
    expect(mapAuthError({ code: "auth/invalid-credential" })).toMatch(/Invalid email or password/);
  });

  it("maps email-already-in-use", () => {
    expect(mapAuthError({ code: "auth/email-already-in-use" })).toMatch(/already exists/);
  });

  it("maps weak-password", () => {
    expect(mapAuthError({ code: "auth/weak-password" })).toMatch(/too weak/);
  });

  it("parses code from Error message", () => {
    expect(
      mapAuthError(new Error("Firebase: Error (auth/wrong-password)."))
    ).toMatch(/Incorrect password/);
  });

  it("falls back for unknown errors", () => {
    expect(mapAuthError(new Error("boom"))).toMatch(/Something went wrong/);
  });
});
