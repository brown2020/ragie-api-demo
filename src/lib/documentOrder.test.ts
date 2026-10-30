import { describe, expect, it } from "vitest";
import { sortDocumentsNewestFirst } from "./documentOrder";

describe("document list order", () => {
  it("sorts newest createdAt first and breaks ties by id", () => {
    const sorted = sortDocumentsNewestFirst([
      { id: "b", createdAtMillis: 10 },
      { id: "c", createdAtMillis: 20 },
      { id: "a", createdAtMillis: 10 },
      { id: "d", createdAtMillis: null },
    ]);
    expect(sorted.map((doc) => doc.id)).toEqual(["c", "b", "a", "d"]);
  });

  it("does not change order across repeated sorts", () => {
    const docs = [
      { id: "m", createdAtMillis: 5 },
      { id: "a", createdAtMillis: 5 },
      { id: "z", createdAtMillis: 5 },
    ];
    const once = sortDocumentsNewestFirst(docs).map((doc) => doc.id);
    const twice = sortDocumentsNewestFirst([...docs].reverse()).map((doc) => doc.id);
    expect(once).toEqual(["z", "m", "a"]);
    expect(twice).toEqual(once);
  });
});
