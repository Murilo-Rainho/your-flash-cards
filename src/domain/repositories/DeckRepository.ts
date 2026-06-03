import type { Deck } from '@/domain/entities/Deck';

/**
 * Porta local de escrita de decks.
 *
 * O deck pertence a uma coleção; a feature valida a coleção pai antes de criar.
 */
export type DeckRepository = {
  create(deck: Deck): Promise<Deck>;
};
