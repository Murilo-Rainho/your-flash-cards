import type { QuickAction } from '@/domain/entities/QuickAction';
import { ROUTES } from '@/constants/routes';
import type { StringCatalog } from '@/strings/types';

export function getHomeQuickActions(
  quickActionStrings: StringCatalog['home']['quickActions'],
): QuickAction[] {
  return [
    {
      id: 'new-collection',
      label: quickActionStrings.newCollection,
      icon: '📚',
      route: ROUTES.COLLECTION_NEW,
    },
    {
      id: 'new-deck',
      label: quickActionStrings.newDeck,
      icon: '🗂️',
      route: ROUTES.DECK_NEW,
    },
    {
      id: 'new-card',
      label: quickActionStrings.newCard,
      icon: '✏️',
      route: ROUTES.CARD_NEW,
    },
    { id: 'import', label: quickActionStrings.import, icon: '📥', disabled: true },
  ];
}
