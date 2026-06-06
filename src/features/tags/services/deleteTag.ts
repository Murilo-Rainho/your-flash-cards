import type { TagRepository } from '@/domain/repositories/TagRepository';

type DeleteTagOptions = {
  repository: TagRepository;
};

/**
 * Exclusão permanente da tag e dos vínculos em `card_tags` (CASCADE no SQLite).
 */
export async function deleteTag(id: string, { repository }: DeleteTagOptions): Promise<void> {
  const trimmedId = id?.trim() ?? '';

  if (!trimmedId) {
    return;
  }

  await repository.delete(trimmedId);
}
