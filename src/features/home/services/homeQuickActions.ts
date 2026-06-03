import type { QuickAction } from '@/domain/entities/QuickAction';
import { ROUTES } from '@/constants/routes';

const homeQuickActions: readonly QuickAction[] = [
  { id: 'new-collection', label: 'Nova Coleção', icon: '📚', route: ROUTES.COLLECTIONS },
  { id: 'new-deck', label: 'Novo Deck', icon: '🗂️', route: ROUTES.DECKS },
  { id: 'new-card', label: 'Novo Card', icon: '✏️', route: ROUTES.CARDS },
  { id: 'import', label: 'Importar', icon: '📥', route: ROUTES.IMPORT },
];

export function getHomeQuickActions(): QuickAction[] {
  return homeQuickActions.map((action) => ({ ...action }));
}
