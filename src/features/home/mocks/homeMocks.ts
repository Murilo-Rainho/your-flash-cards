import type { DailyStudySummary } from '@/domain/entities/DailyStudySummary';
import type { QuickAction } from '@/domain/entities/QuickAction';
import type { CollectionSummary } from '@/features/home/types';

/**
 * Dados mockados da Home (V1).
 *
 * Temporário e local: simula o que, no futuro, virá dos repositórios offline-first
 * via `useHomeData`. Nenhum acesso a banco/rede aqui.
 */

const NOW = '2026-06-02T08:00:00.000Z';

export const mockDailyStudySummary: DailyStudySummary = {
  dueCards: 23,
  difficultCards: 5,
  reviewedToday: 12,
  retentionPercentage: 91,
  streakDays: 7,
  masteredCards: 482,
};

export const mockCollections: CollectionSummary[] = [
  {
    collection: {
      id: 'col-pt-en',
      name: 'Português → Inglês',
      baseLanguage: 'pt',
      targetLanguage: 'en',
      createdAt: NOW,
      updatedAt: NOW,
    },
    totalCards: 540,
    dueCards: 23,
    masteredPercentage: 78,
  },
  {
    collection: {
      id: 'col-pt-es',
      name: 'Português → Espanhol',
      baseLanguage: 'pt',
      targetLanguage: 'es',
      createdAt: NOW,
      updatedAt: NOW,
    },
    totalCards: 120,
    dueCards: 4,
    masteredPercentage: 42,
  },
];

export const mockQuickActions: QuickAction[] = [
  { id: 'new-collection', label: 'Nova Coleção', icon: '📚' },
  { id: 'new-deck', label: 'Novo Deck', icon: '🗂️' },
  { id: 'new-card', label: 'Novo Card', icon: '✏️' },
  { id: 'import', label: 'Importar', icon: '📥' },
];
