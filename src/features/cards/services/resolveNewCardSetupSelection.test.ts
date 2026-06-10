import type { Collection } from '@/domain/entities/Collection';
import type { Deck } from '@/domain/entities/Deck';

import { resolveCollectionSelection, resolveDeckSelection } from './resolveNewCardSetupSelection';

const timestamp = '2026-01-01T00:00:00.000Z';

const makeCollection = (id: string): Collection => ({
  id,
  name: id,
  baseLanguage: 'pt',
  targetLanguage: 'en',
  createdAt: timestamp,
  updatedAt: timestamp,
});

const makeDeck = (id: string, collectionId = 'collection-a'): Deck => ({
  id,
  collectionId,
  name: id,
  autoGenerateReverseCards: false,
  createdAt: timestamp,
  updatedAt: timestamp,
});

describe('resolveNewCardSetupSelection', () => {
  it('prefers the valid route collection before falling back to the first collection', () => {
    expect(
      resolveCollectionSelection({
        collections: [makeCollection('collection-a'), makeCollection('collection-b')],
        selectedCollectionId: '',
        routeCollectionId: 'collection-b',
      }),
    ).toBe('collection-b');
  });

  it('prefers the valid route deck before falling back to the first deck', () => {
    expect(
      resolveDeckSelection({
        decks: [makeDeck('deck-a'), makeDeck('deck-b')],
        selectedDeckId: '',
        routeDeckId: 'deck-b',
      }),
    ).toBe('deck-b');
  });

  it('keeps the current valid user selection', () => {
    expect(
      resolveDeckSelection({
        decks: [makeDeck('deck-a'), makeDeck('deck-b')],
        selectedDeckId: 'deck-a',
        routeDeckId: 'deck-b',
      }),
    ).toBe('deck-a');
  });
});
