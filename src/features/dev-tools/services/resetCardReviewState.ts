import type { QueryClient } from '@tanstack/react-query';

import type { SQLiteDevToolsRepository } from '@/infrastructure/database/sqlite/repositories/SQLiteDevToolsRepository';

import { invalidateAppQueries } from './invalidateAppQueries';

type ResetCardReviewStateOptions = {
  devToolsRepository: SQLiteDevToolsRepository;
  queryClient: QueryClient;
  now?: () => Date;
};

export async function resetCardReviewState(
  cardIds: string[],
  { devToolsRepository, queryClient, now = () => new Date() }: ResetCardReviewStateOptions,
): Promise<number> {
  const affectedVariants = await devToolsRepository.resetReviewStateForCardIds(cardIds, now());
  await invalidateAppQueries(queryClient);
  return affectedVariants;
}

export async function resetAllCardReviewState({
  devToolsRepository,
  queryClient,
  now = () => new Date(),
}: Omit<ResetCardReviewStateOptions, 'cardIds'>): Promise<number> {
  const affectedVariants = await devToolsRepository.resetAllReviewState(now());
  await invalidateAppQueries(queryClient);
  return affectedVariants;
}

export async function makeAllCardsDueNow({
  devToolsRepository,
  queryClient,
  now = () => new Date(),
}: Omit<ResetCardReviewStateOptions, 'cardIds'>): Promise<number> {
  const affectedVariants = await devToolsRepository.makeAllCardsDueNow(now());
  await invalidateAppQueries(queryClient);
  return affectedVariants;
}

export async function clearAllReviewLogs({
  devToolsRepository,
  queryClient,
}: Pick<ResetCardReviewStateOptions, 'devToolsRepository' | 'queryClient'>): Promise<number> {
  const deletedLogs = await devToolsRepository.clearAllReviewLogs();
  await invalidateAppQueries(queryClient);
  return deletedLogs;
}
