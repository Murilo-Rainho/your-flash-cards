import type { Collection } from '@/domain/entities/Collection';

/**
 * CollectionSummary — read-model da Home: a `Collection` pura + agregados derivados.
 *
 * Mantém a entidade `Collection` livre de stats calculadas (§30.2, regra 01-layering).
 * É este o tipo consumido por `CollectionSummaryCard`.
 */
export type CollectionSummary = {
  collection: Collection;
  totalCards: number;
  dueCards: number;
  masteredPercentage: number;
};
