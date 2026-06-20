import type { TagRepository } from '@/domain/repositories/TagRepository';

type DeleteTagOptions = {
  repository: TagRepository;
};

/**
 * Permanent deletion of the tag and links in `card_tags` (CASCADE in SQLite).
 */
export async function deleteTag(id: string, { repository }: DeleteTagOptions): Promise<void> {
  const trimmedId = id?.trim() ?? '';

  if (!trimmedId) {
    return;
  }

  await repository.delete(trimmedId);
}
