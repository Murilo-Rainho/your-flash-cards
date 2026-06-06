import type { CardRepository } from '@/domain/repositories/CardRepository';

type DeleteCardOptions = {
  cardRepository: CardRepository;
  now?: () => Date;
};

/**
 * Exclusão de card (soft-delete via `archivedAt`, pronto para sync futura).
 * Os arquivos de mídia são mantidos em disco na V1.
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
