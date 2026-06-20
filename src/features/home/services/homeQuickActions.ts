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
      icon: 'collection',
      route: ROUTES.COLLECTION_NEW,
    },
    {
      id: 'new-deck',
      label: quickActionStrings.newDeck,
      icon: 'deck',
      route: ROUTES.DECK_NEW,
    },
    {
      id: 'new-card',
      label: quickActionStrings.newCard,
      icon: 'card',
      route: ROUTES.CARD_NEW,
    },
    {
      id: 'import',
      label: quickActionStrings.import,
      icon: 'import',
      route: ROUTES.IMPORT,
    },
    // No route: handled in-place by the Home screen, which opens the export modal.
    { id: 'export', label: quickActionStrings.export, icon: 'export' },
  ];
}
