import { ROUTES, type Route } from '@/constants/routes';
import type { CollectionSummary } from '@/features/home/types';

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
};

function formatDueCards(dueCards: number): string {
  return `${dueCards} ${dueCards === 1 ? 'card vencido' : 'cards vencidos'}`;
}

export function getReviewNowCardState({
  dueCards,
  collections,
}: GetReviewNowCardStateInput): ReviewNowCardState {
  if (collections && collections.length === 0) {
    return {
      action: 'create-collection',
      title: 'Crie sua primeira coleção',
      subtitle: 'Comece criando uma coleção para organizar seus idiomas.',
      accessibilityLabel: 'Crie sua primeira coleção para organizar seus idiomas',
      route: ROUTES.COLLECTION_NEW,
    };
  }

  if (collections) {
    const totalDecks = collections.reduce((sum, item) => sum + item.totalDecks, 0);

    if (totalDecks === 0) {
      return {
        action: 'create-deck',
        title: 'Crie seu primeiro deck',
        subtitle: 'Adicione um deck à sua coleção para separar seus estudos por tema.',
        accessibilityLabel: 'Crie seu primeiro deck para separar seus estudos por tema',
        route: ROUTES.DECK_NEW,
      };
    }

    const totalCards = collections.reduce((sum, item) => sum + item.totalCards, 0);

    if (totalCards === 0) {
      return {
        action: 'create-card',
        title: 'Crie seu primeiro card',
        subtitle: 'Adicione um card ao deck para começar suas revisões.',
        accessibilityLabel: 'Crie seu primeiro card para começar suas revisões',
        route: ROUTES.CARD_NEW,
      };
    }
  }

  if (dueCards > 0) {
    const dueCardsLabel = formatDueCards(dueCards);

    return {
      action: 'review',
      title: 'Revisar agora',
      subtitle: dueCardsLabel,
      accessibilityLabel: `Revisar agora, ${dueCardsLabel}`,
    };
  }

  return {
    action: 'done',
    title: 'Tudo revisado por hoje',
    subtitle: 'Volte amanhã para manter o seu streak 🔥',
    accessibilityLabel: 'Tudo revisado por hoje',
  };
}
