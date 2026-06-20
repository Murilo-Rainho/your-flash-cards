import type { Collection } from './Collection';

/**
 * CollectionSummary — local read-model for dashboards/lists.
 *
 * Keeps `Collection` pure (§30.2) and places derived aggregates outside the entity.
 */
export type CollectionSummary = {
  collection: Collection;
  /** Total active decks in the collection. */
  totalDecks: number;
  /** Total active physical cards in the collection. */
  totalCards: number;
  /** Total due review units (`ReviewItem.nextReviewAt <= now`). */
  dueCards: number;
  /** Percentage of review units considered mastered. */
  masteredPercentage: number;
};
