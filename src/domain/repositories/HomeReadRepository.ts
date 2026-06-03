import type { CollectionSummary } from '@/domain/entities/CollectionSummary';
import type { DailyStudySummary } from '@/domain/entities/DailyStudySummary';

/**
 * Porta de leitura local da Home/Dashboard.
 *
 * A implementação concreta pode consultar SQLite, mas a feature consome apenas este contrato.
 */
export type HomeReadRepository = {
  getDailyStudySummary(now: Date): Promise<DailyStudySummary>;
  listCollectionSummaries(now: Date): Promise<CollectionSummary[]>;
};
