import type { QuickAction } from '@/domain/entities/QuickAction';
import { ROUTES } from '@/constants/routes';

const homeQuickActions: readonly QuickAction[] = [
  { id: 'new-collection', label: 'Nova Coleção', icon: '📚', route: ROUTES.COLLECTION_NEW },
  { id: 'new-deck', label: 'Novo Deck', icon: '🗂️', route: ROUTES.DECK_NEW },
  { id: 'new-card', label: 'Novo Card', icon: '✏️', route: ROUTES.CARD_NEW },
  { id: 'import', label: 'Importar', icon: '📥', disabled: true },
];

export function getHomeQuickActions(): QuickAction[] {
  return homeQuickActions.map((action) => ({ ...action }));
}
