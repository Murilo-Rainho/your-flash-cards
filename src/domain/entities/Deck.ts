/**
 * Deck (§30.3) — contexto, tema ou objetivo dentro de uma coleção.
 *
 * Entidade pura (TS puro, sem React/RN/Expo). Decks pertencem a uma coleção e a V1
 * não possui subdecks (§5.2).
 */
export type Deck = {
  id: string;
  collectionId: string;
  name: string;
  description?: string;
  autoGenerateReverseCards: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};
