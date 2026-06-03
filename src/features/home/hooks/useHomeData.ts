import type { DailyStudySummary } from '@/domain/entities/DailyStudySummary';
import type { QuickAction } from '@/domain/entities/QuickAction';
import {
  mockCollections,
  mockDailyStudySummary,
  mockQuickActions,
} from '@/features/home/mocks/homeMocks';
import { getGreeting } from '@/features/home/services/getGreeting';
import type { CollectionSummary } from '@/features/home/types';

export type HomeData = {
  greeting: string;
  summary: DailyStudySummary;
  collections: CollectionSummary[];
  quickActions: QuickAction[];
};

/**
 * Fonte de dados da Home.
 *
 * Hoje devolve mocks locais. **Este hook é o ponto de injeção**: no futuro, troca-se a
 * origem por repositórios offline-first (via React Query) sem mexer na UI da tela.
 */
export function useHomeData(): HomeData {
  return {
    greeting: getGreeting(),
    summary: mockDailyStudySummary,
    collections: mockCollections,
    quickActions: mockQuickActions,
  };
}
