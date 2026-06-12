import { describe, expect, it } from '@jest/globals';

import type { CollectionSummary } from '@/features/home/types';
import { ROUTES } from '@/constants/routes';
import { ptBR } from '@/strings/locales/pt-BR';

import { getReviewNowCardState } from './getReviewNowCardState';

const reviewNowStrings = ptBR.home.reviewNow;

const baseCollection = {
  id: 'collection-pt-en',
  name: 'Português para Inglês',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-02T10:00:00.000Z',
};

function collectionSummary(overrides: Partial<CollectionSummary> = {}): CollectionSummary {
  return {
    collection: baseCollection,
    totalDecks: 1,
    totalCards: 1,
    dueCards: 0,
    masteredPercentage: 0,
    ...overrides,
  };
}

describe('getReviewNowCardState', () => {
  it('guides the user to create the first collection when none exist', () => {
    expect(
      getReviewNowCardState({ dueCards: 0, collections: [], strings: reviewNowStrings }),
    ).toMatchObject({
      action: 'create-collection',
      title: 'Crie sua primeira coleção',
      route: ROUTES.COLLECTION_NEW,
    });
  });

  it('guides the user to create the first deck when collections have no decks', () => {
    expect(
      getReviewNowCardState({
        dueCards: 0,
        collections: [collectionSummary({ totalDecks: 0, totalCards: 0 })],
        strings: reviewNowStrings,
      }),
    ).toMatchObject({
      action: 'create-deck',
      title: 'Crie seu primeiro deck',
      route: ROUTES.DECK_NEW,
    });
  });

  it('guides the user to create the first card when decks exist but cards do not', () => {
    expect(
      getReviewNowCardState({
        dueCards: 0,
        collections: [collectionSummary({ totalDecks: 2, totalCards: 0 })],
        strings: reviewNowStrings,
      }),
    ).toMatchObject({
      action: 'create-card',
      title: 'Crie seu primeiro card',
      route: ROUTES.CARD_NEW,
    });
  });

  it('keeps the review CTA when there are due cards', () => {
    expect(
      getReviewNowCardState({
        dueCards: 1,
        collections: [collectionSummary({ totalDecks: 1, totalCards: 3 })],
        strings: reviewNowStrings,
      }),
    ).toMatchObject({
      action: 'review',
      title: 'Revisar agora',
      subtitle: '1 card vencido',
      route: ROUTES.REVIEW,
    });
  });

  it('shows the reviewed state when collections, decks and cards exist with nothing due', () => {
    expect(
      getReviewNowCardState({
        dueCards: 0,
        collections: [collectionSummary({ totalDecks: 1, totalCards: 3 })],
        strings: reviewNowStrings,
      }),
    ).toMatchObject({
      action: 'done',
      title: 'Tudo revisado por hoje',
    });
  });
});
