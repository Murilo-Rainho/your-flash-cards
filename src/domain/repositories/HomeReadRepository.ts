import type { CollectionSummary } from '@/domain/entities/CollectionSummary';
import type { DailyStudySummary } from '@/domain/entities/DailyStudySummary';

/**
 * Local read port for Home/Dashboard.
 *
 * The concrete implementation may query SQLite, but the feature consumes only this contract.
 */
export type HomeReadRepository = {
  getDailyStudySummary(now: Date): Promise<DailyStudySummary>;
  listCollectionSummaries(now: Date): Promise<CollectionSummary[]>;
};
