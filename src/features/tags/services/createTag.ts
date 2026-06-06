import { LIMITS } from '@/constants/limits';
import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';
import { createLocalId, type IdFactory } from '@/utils/ids';
import { normalizeTagKey, normalizeTagName } from '@/utils/normalizeText';
import type { FieldErrors } from '@/utils/validation';

const { MAX_TAG_LENGTH } = LIMITS;

export type CreateTagInput = {
  collectionId: string;
  name: string;
};

export type CreateTagField = 'collectionId' | 'name';

type CreateTagOptions = {
  repository: TagRepository;
  idFactory?: IdFactory;
  now?: () => Date;
};

export class CreateTagInputError extends Error {
  constructor(readonly fieldErrors: FieldErrors<CreateTagField>) {
    super('Dados invalidos para criar tag.');
    this.name = 'CreateTagInputError';
  }
}

export function isCreateTagInputError(error: unknown): error is CreateTagInputError {
  return error instanceof CreateTagInputError;
}

/**
 * Cria (ou reaproveita) uma tag a partir de um nome livre, escopada à collection.
 *
 * A persistência é idempotente por `(collectionId, normalizedName)`: se já existir uma tag
 * com a mesma chave na coleção, a linha canônica existente é retornada — evitando
 * duplicatas como "verbs" vs "Verb" (§6/§30.7).
 */
export async function createTag(
  input: CreateTagInput,
  { repository, idFactory = () => createLocalId('tag'), now = () => new Date() }: CreateTagOptions,
): Promise<Tag> {
  const collectionId = input.collectionId?.trim() ?? '';
  const name = normalizeTagName(input.name);
  const fieldErrors: FieldErrors<CreateTagField> = {};

  if (!collectionId) {
    fieldErrors.collectionId = 'Escolha uma colecao.';
  }

  if (!name) {
    fieldErrors.name = 'Informe o nome da tag.';
  } else if (name.length > MAX_TAG_LENGTH) {
    fieldErrors.name = `Use tags com no maximo ${MAX_TAG_LENGTH} caracteres.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new CreateTagInputError(fieldErrors);
  }

  const timestamp = now().toISOString();
  const tag: Tag = {
    id: idFactory(),
    collectionId,
    name,
    normalizedName: normalizeTagKey(name),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return repository.createIfAbsent(tag);
}
