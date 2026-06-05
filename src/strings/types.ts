import type { ReviewRating } from '@/constants/reviewRatings';

export const SUPPORTED_LOCALES = ['pt-BR', 'en-US'] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = 'pt-BR';

export function isLocaleCode(value: string): value is LocaleCode {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export type StringCatalog = {
  common: {
    save: string;
    saving: string;
    cancel: string;
    next: string;
    back: string;
    loading: string;
    retry: string;
    retryHint: string;
    settings: string;
    front: string;
    backSide: string;
    recommended: string;
    none: string;
  };
  home: {
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    progressTitle: string;
    collectionsTitle: string;
    loadingLocalData: string;
    loadErrorTitle: string;
    loadErrorRetryA11y: string;
    noCollections: string;
    dueCardsToday: string;
    dueCardsTodayNone: string;
    stats: {
      reviewedToday: string;
      retention: string;
      streak: string;
      mastered: string;
    };
    quickActions: {
      newCollection: string;
      newDeck: string;
      newCard: string;
      import: string;
      hintClickHere: string;
      hintStartHere: string;
      closeA11y: string;
    };
    reviewNow: {
      createCollectionTitle: string;
      createCollectionSubtitle: string;
      createCollectionA11y: string;
      createDeckTitle: string;
      createDeckSubtitle: string;
      createDeckA11y: string;
      createCardTitle: string;
      createCardSubtitle: string;
      createCardA11y: string;
      reviewTitle: string;
      reviewA11yPrefix: string;
      dueCardSingular: string;
      dueCardPlural: string;
      doneTitle: string;
      doneSubtitle: string;
      doneA11y: string;
    };
  };
  collections: {
    newTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    baseLanguageLabel: string;
    targetLanguageLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    saveLabel: string;
    saveA11y: string;
    createError: string;
  };
  decks: {
    newTitle: string;
    loadingCollections: string;
    collectionLabel: string;
    collectionPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    reverseCardsLabel: string;
    reverseCardsHint: string;
    saveLabel: string;
    saveA11y: string;
    loadCollectionsError: string;
    loadCollectionsRetryA11y: string;
    noCollections: string;
    createCollection: string;
    createCollectionA11y: string;
    collectionA11yPrefix: string;
    createError: string;
  };
  cards: {
    newTitle: string;
    stepSetup: string;
    stepContent: string;
    stepTypeTitle: string;
    stepTypeSubtitle: string;
    stepContentTitle: string;
    stepContentSubtitle: string;
    loadingCollections: string;
    loadCollectionsError: string;
    loadCollectionsRetryA11y: string;
    noCollections: string;
    createCollection: string;
    createCollectionA11y: string;
    noDecksInCollection: string;
    createDeck: string;
    createDeckA11y: string;
    typeLabel: string;
    typePlaceholder: string;
    loadingDecks: string;
    testLabel: string;
    testA11y: string;
    saveA11y: string;
    collectionLabel: string;
    collectionPlaceholder: string;
    deckLabel: string;
    deckPlaceholder: string;
    reverseModeAuto: string;
    reverseModeOriginalOnly: string;
    saveLabel: string;
    savingLabel: string;
    stopRecordingToSave: string;
    savedNextReady: string;
    cardTypes: {
      cloze: { label: string; description: string; backPlaceholder: string };
      vocabulary: {
        label: string;
        description: string;
        frontPlaceholder: string;
        backPlaceholder: string;
      };
      listening: {
        label: string;
        description: string;
        frontPlaceholder: string;
        backPlaceholder: string;
      };
      typing: {
        label: string;
        description: string;
        frontPlaceholder: string;
        backPlaceholder: string;
      };
      pronunciation: {
        label: string;
        description: string;
        frontPlaceholder: string;
        backPlaceholder: string;
      };
    };
  };
  review: {
    ratings: Record<ReviewRating, string>;
    reviewCardTitle: string;
    howDidYouDo: string;
    flipVerify: string;
    flipCard: string;
    correct: string;
    incorrect: string;
    actuallyWrong: string;
    expectedAnswer: string;
  };
  tags: {
    title: string;
    createPlaceholder: string;
    createError: string;
  };
  settings: {
    title: string;
    languageSection: string;
    languageDescription: string;
    themeSection: string;
    themeDescription: string;
    paletteDefault: string;
    paletteOcean: string;
    paletteForest: string;
    paletteMidnight: string;
    paletteCarbon: string;
    saved: string;
  };
};
