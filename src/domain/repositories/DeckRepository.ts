import type { Deck } from '@/domain/entities/Deck';

/**
 * Local write port for decks.
 *
 * A deck belongs to a collection; the feature validates the parent collection before create.
 */
export type DeckRepository = {
  create(deck: Deck): Promise<Deck>;
  update(deck: Deck): Promise<Deck>;
  listActiveByCollection(collectionId: string): Promise<Deck[]>;
  findById(id: string): Promise<Deck | null>;
};
