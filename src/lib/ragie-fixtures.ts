/**
 * Labeled fixtures for Ragie retrieve/upload demo responses.
 * Used when RAGIE_USE_FIXTURES=true (CI / app-eval) to avoid burning paid Ragie credits.
 * Fixtures cannot prove live Ragie retrieval quality, indexing latency, or credit metering.
 */

export const FIXTURE_CHUNKS = {
  scored_chunks: [
    {
      text: "[fixture] Sample document chunk about retrieval-augmented generation. No live Ragie call.",
      score: 0.92,
    },
    {
      text: "[fixture] Second chunk describing document metadata filtering by userId. Fixture only.",
      score: 0.81,
    },
  ],
};

export const FIXTURE_UPLOAD = {
  id: "fixture-doc-001",
  status: "pending",
  name: "fixture-document.txt",
  metadata: { title: "fixture-document.txt", scope: "tutorial", userId: "fixture-uid" },
  fixture: true,
};

/** True when fixture short-circuit is enabled (CI / until-100). */
export function ragieFixturesEnabled(): boolean {
  return process.env.RAGIE_USE_FIXTURES === "true";
}
