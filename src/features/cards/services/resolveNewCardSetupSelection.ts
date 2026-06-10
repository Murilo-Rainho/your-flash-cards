import type { Collection } from '@/domain/entities/Collection';
import type { Deck } from '@/domain/entities/Deck';

type ResolveCollectionSelectionInput = {
  collections: Collection[];
  selectedCollectionId: string;
  routeCollectionId?: string;
};

type ResolveDeckSelectionInput = {
  decks: Deck[];
  selectedDeckId: string;
  routeDeckId?: string;
};

export function resolveCollectionSelection({
  collections,
  selectedCollectionId,
  routeCollectionId,
}: ResolveCollectionSelectionInput): string {
  if (collections.some((collection) => collection.id === selectedCollectionId)) {
    return selectedCollectionId;
  }

  if (routeCollectionId && collections.some((collection) => collection.id === routeCollectionId)) {
    return routeCollectionId;
  }

  return collections[0]?.id ?? '';
}

export function resolveDeckSelection({
  decks,
  selectedDeckId,
  routeDeckId,
}: ResolveDeckSelectionInput): string {
  if (decks.some((deck) => deck.id === selectedDeckId)) {
    return selectedDeckId;
  }

  if (routeDeckId && decks.some((deck) => deck.id === routeDeckId)) {
    return routeDeckId;
  }

  return decks[0]?.id ?? '';
}
