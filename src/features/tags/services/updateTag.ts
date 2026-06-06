import { LIMITS } from '@/constants/limits';
import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';
import { normalizeTagKey, normalizeTagName } from '@/utils/normalizeText';
import type { FieldErrors } from '@/utils/validation';

const { MAX_TAG_LENGTH } = LIMITS;

export type UpdateTagInput = {
  id: string;
  name: string;
};

export type UpdateTagField = 'name';

type UpdateTagOptions = {
  repository: TagRepository;
  now?: () => Date;
};

export class UpdateTagInputError extends Error {
  constructor(readonly fieldErrors: FieldErrors<UpdateTagField>) {
    super('Dados invalidos para editar tag.');
    this.name = 'UpdateTagInputError';
  }
}

export function isUpdateTagInputError(error: unknown): error is UpdateTagInputError {
  return error instanceof UpdateTagInputError;
}

export async function updateTag(
  input: UpdateTagInput,
  { repository, now = () => new Date() }: UpdateTagOptions,
): Promise<Tag> {
  const id = input.id?.trim() ?? '';
  const name = normalizeTagName(input.name);
  const fieldErrors: FieldErrors<UpdateTagField> = {};

  if (!id) {
    throw new UpdateTagInputError({ name: 'Tag nao encontrada.' });
  }

  if (!name) {
    fieldErrors.name = 'Informe o nome da tag.';
  } else if (name.length > MAX_TAG_LENGTH) {
    fieldErrors.name = `Use tags com no maximo ${MAX_TAG_LENGTH} caracteres.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new UpdateTagInputError(fieldErrors);
  }

  const existing = await repository.findById(id);

  if (!existing) {
    throw new UpdateTagInputError({ name: 'Tag nao encontrada.' });
  }

  const normalizedName = normalizeTagKey(name);

  if (normalizedName !== existing.normalizedName) {
    const conflict = await repository.findByCollectionAndNormalizedName(
      existing.collectionId,
      normalizedName,
    );

    if (conflict && conflict.id !== existing.id) {
      throw new UpdateTagInputError({ name: 'Ja existe uma tag com esse nome nesta colecao.' });
    }
  }

  const updated: Tag = {
    ...existing,
    name,
    normalizedName,
    updatedAt: now().toISOString(),
  };

  return repository.update(updated);
}
