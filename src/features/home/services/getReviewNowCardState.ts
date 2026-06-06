import { ROUTES, type Route } from '@/constants/routes';
import type { CollectionSummary } from '@/features/home/types';
import type { StringCatalog } from '@/strings/types';

type ReviewNowCardAction = 'create-collection' | 'create-deck' | 'create-card' | 'review' | 'done';

export type ReviewNowCardState = {
  action: ReviewNowCardAction;
  title: string;
  subtitle: string;
  accessibilityLabel: string;
  route?: Route;
};

type GetReviewNowCardStateInput = {
  dueCards: number;
  collections?: CollectionSummary[];
  strings: StringCatalog['home']['reviewNow'];
};

function formatDueCards(dueCards: number, strings: StringCatalog['home']['reviewNow']): string {
  const label = dueCards === 1 ? strings.dueCardSingular : strings.dueCardPlural;
  return `${dueCards} ${label}`;
}

export function getReviewNowCardState({
  dueCards,
  collections,
  strings,
}: GetReviewNowCardStateInput): ReviewNowCardState {
  if (collections && collections.length === 0) {
    return {
      action: 'create-collection',
      title: strings.createCollectionTitle,
      subtitle: strings.createCollectionSubtitle,
      accessibilityLabel: strings.createCollectionA11y,
      route: ROUTES.COLLECTION_NEW,
    };
  }

  if (collections) {
    const totalDecks = collections.reduce((sum, item) => sum + item.totalDecks, 0);

    if (totalDecks === 0) {
      return {
        action: 'create-deck',
        title: strings.createDeckTitle,
        subtitle: strings.createDeckSubtitle,
        accessibilityLabel: strings.createDeckA11y,
        route: ROUTES.DECK_NEW,
      };
    }

    const totalCards = collections.reduce((sum, item) => sum + item.totalCards, 0);

    if (totalCards === 0) {
      return {
        action: 'create-card',
        title: strings.createCardTitle,
        subtitle: strings.createCardSubtitle,
        accessibilityLabel: strings.createCardA11y,
        route: ROUTES.CARD_NEW,
      };
    }
  }

  if (dueCards > 0) {
    const dueCardsLabel = formatDueCards(dueCards, strings);

    return {
      action: 'review',
      title: strings.reviewTitle,
      subtitle: dueCardsLabel,
      accessibilityLabel: `${strings.reviewA11yPrefix} ${dueCardsLabel}`,
      route: ROUTES.REVIEW,
    };
  }

  return {
    action: 'done',
    title: strings.doneTitle,
    subtitle: strings.doneSubtitle,
    accessibilityLabel: strings.doneA11y,
  };
}
