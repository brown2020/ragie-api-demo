import { describe, expect, it } from "vitest";
import { pickEditableProfileFields } from "./profileFields";

describe("pickEditableProfileFields", () => {
  it("omits credits from client profile updates", () => {
    expect(
      pickEditableProfileFields({
        displayName: "Ada",
        credits: 1_000_000,
        emailVerified: true,
      })
    ).toEqual({
      displayName: "Ada",
      emailVerified: true,
    });
  });
});
