import { z } from 'zod';

import type { Deck } from '@/domain/entities/Deck';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import { mapZodFieldErrors, type FieldErrors } from '@/utils/validation';

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;

/**
 * Deck edit. Parent collection is immutable: the deck stays linked to the collection
 * where it was created (cannot be moved to another collection).
 */
export type UpdateDeckInput = {
  id: string;
  name: string;
  description?: string;
  autoGenerateReverseCards: boolean;
};

export type UpdateDeckField = 'name' | 'description' | 'autoGenerateReverseCards';

type UpdateDeckOptions = {
  deckRepository: DeckRepository;
  now?: () => Date;
};

const updateDeckSchema = z.object({
  id: z.string().trim().min(1),
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do deck.')
    .max(MAX_NAME_LENGTH, `Use no máximo ${MAX_NAME_LENGTH} caracteres.`),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, `Use no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`)
    .optional(),
  autoGenerateReverseCards: z.boolean(),
});

export class UpdateDeckInputError extends Error {
  constructor(readonly fieldErrors: FieldErrors<UpdateDeckField>) {
    super('Dados inválidos para editar deck.');
    this.name = 'UpdateDeckInputError';
  }
}

export function isUpdateDeckInputError(error: unknown): error is UpdateDeckInputError {
  return error instanceof UpdateDeckInputError;
}

export async function updateDeck(
  input: UpdateDeckInput,
  { deckRepository, now = () => new Date() }: UpdateDeckOptions,
): Promise<Deck> {
  const parsed = updateDeckSchema.safeParse(input);

  if (!parsed.success) {
    throw new UpdateDeckInputError(mapZodFieldErrors<UpdateDeckField>(parsed.error.issues));
  }

  const existing = await deckRepository.findById(parsed.data.id);

  if (!existing) {
    throw new UpdateDeckInputError({ name: 'Deck não encontrado.' });
  }

  const updated: Deck = {
    ...existing,
    name: parsed.data.name,
    description: parsed.data.description || undefined,
    autoGenerateReverseCards: parsed.data.autoGenerateReverseCards,
    updatedAt: now().toISOString(),
  };

  return deckRepository.update(updated);
}
