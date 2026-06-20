import { z } from 'zod';

import type { Collection } from '@/domain/entities/Collection';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import { mapZodFieldErrors, type FieldErrors } from '@/utils/validation';

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;

/**
 * Collection edit: only `name` and `description`. Base/target languages are
 * immutable (changing them would break the contract with existing cards).
 */
export type UpdateCollectionInput = {
  id: string;
  name: string;
  description?: string;
};

export type UpdateCollectionField = 'name' | 'description';

type UpdateCollectionOptions = {
  repository: CollectionRepository;
  now?: () => Date;
};

const updateCollectionSchema = z.object({
  id: z.string().trim().min(1),
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome da coleção.')
    .max(MAX_NAME_LENGTH, `Use no máximo ${MAX_NAME_LENGTH} caracteres.`),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, `Use no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`)
    .optional(),
});

export class UpdateCollectionInputError extends Error {
  constructor(readonly fieldErrors: FieldErrors<UpdateCollectionField>) {
    super('Dados inválidos para editar coleção.');
    this.name = 'UpdateCollectionInputError';
  }
}

export function isUpdateCollectionInputError(error: unknown): error is UpdateCollectionInputError {
  return error instanceof UpdateCollectionInputError;
}

export async function updateCollection(
  input: UpdateCollectionInput,
  { repository, now = () => new Date() }: UpdateCollectionOptions,
): Promise<Collection> {
  const parsed = updateCollectionSchema.safeParse(input);

  if (!parsed.success) {
    throw new UpdateCollectionInputError(
      mapZodFieldErrors<UpdateCollectionField>(parsed.error.issues),
    );
  }

  const existing = await repository.findById(parsed.data.id);

  if (!existing) {
    throw new UpdateCollectionInputError({ name: 'Coleção não encontrada.' });
  }

  const updated: Collection = {
    ...existing,
    name: parsed.data.name,
    description: parsed.data.description || undefined,
    updatedAt: now().toISOString(),
  };

  return repository.update(updated);
}
