import { LIMITS } from '@/constants/limits';
import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';
import { createLocalId, type IdFactory } from '@/utils/ids';
import { normalizeTagKey, normalizeTagName } from '@/utils/normalizeText';
import type { FieldErrors } from '@/utils/validation';

const { MAX_TAG_LENGTH } = LIMITS;

export type CreateTagInput = {
  name: string;
};

export type CreateTagField = 'name';

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
 * Cria (ou reaproveita) uma tag a partir de um nome livre.
 *
 * A persistência é idempotente por `normalizedName`: se já existir uma tag com a mesma
 * chave normalizada, a linha canônica existente é retornada — evitando duplicatas como
 * "verbs" vs "Verb" (§6/§30.7).
 */
export async function createTag(
  input: CreateTagInput,
  { repository, idFactory = () => createLocalId('tag'), now = () => new Date() }: CreateTagOptions,
): Promise<Tag> {
  const name = normalizeTagName(input.name);

  if (!name) {
    throw new CreateTagInputError({ name: 'Informe o nome da tag.' });
  }

  if (name.length > MAX_TAG_LENGTH) {
    throw new CreateTagInputError({
      name: `Use tags com no maximo ${MAX_TAG_LENGTH} caracteres.`,
    });
  }

  const timestamp = now().toISOString();
  const tag: Tag = {
    id: idFactory(),
    name,
    normalizedName: normalizeTagKey(name),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return repository.createIfAbsent(tag);
}
