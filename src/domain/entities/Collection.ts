/**
 * Collection (§30.2) — represents a **language pair** (base → target), not just the target.
 *
 * Pure entity (pure TS, no React/RN/Expo). Derived aggregates shown on Home (totalCards,
 * dueCards, % mastered) do **not** live here: they live in read-models like
 * `CollectionSummary` (see `src/features/home/types.ts`). Fields per `domain-model.md`.
 */
export type Collection = {
  id: string;
  name: string;
  baseLanguage: string;
  targetLanguage: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};
