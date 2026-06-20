import type { CardRepository } from '@/domain/repositories/CardRepository';

type DeleteCardOptions = {
  cardRepository: CardRepository;
  now?: () => Date;
};

/**
 * Card deletion (soft-delete via `archivedAt`, ready for future sync).
 * Media files are kept on disk in V1.
 */
export async function deleteCard(
  id: string,
  { cardRepository, now = () => new Date() }: DeleteCardOptions,
): Promise<void> {
  const trimmedId = id?.trim() ?? '';

  if (!trimmedId) {
    return;
  }

  await cardRepository.archiveCard(trimmedId, now().toISOString());
}
