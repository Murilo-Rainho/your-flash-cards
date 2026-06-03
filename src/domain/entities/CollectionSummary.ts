import type { Collection } from './Collection';

/**
 * CollectionSummary — read-model local para dashboards/listas.
 *
 * Mantém `Collection` pura (§30.2) e coloca agregados derivados fora da entidade.
 */
export type CollectionSummary = {
  collection: Collection;
  /** Total de decks ativos na coleção. */
  totalDecks: number;
  /** Total de cards físicos ativos na coleção. */
  totalCards: number;
  /** Total de unidades revisáveis vencidas (`ReviewItem.nextReviewAt <= now`). */
  dueCards: number;
  /** Percentual de unidades revisáveis consideradas dominadas. */
  masteredPercentage: number;
};
