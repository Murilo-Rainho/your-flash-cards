/**
 * Deck (§30.3) — context, theme, or goal within a collection.
 *
 * Pure entity (pure TS, no React/RN/Expo). Decks belong to a collection and V1 has no
 * subdecks (§5.2).
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
