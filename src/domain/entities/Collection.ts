/**
 * Collection (§30.2) — representa um **par de idiomas** (base → alvo), não só o alvo.
 *
 * Entidade pura (TS puro, sem React/RN/Expo). Os agregados derivados exibidos na Home
 * (totalCards, dueCards, % dominados) **não** moram aqui: vivem em read-models como
 * `CollectionSummary` (ver `src/features/home/types.ts`). Campos conforme `domain-model.md`.
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
