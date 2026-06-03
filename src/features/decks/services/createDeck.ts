import { z } from 'zod';

import type { Deck } from '@/domain/entities/Deck';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import { createLocalId, type IdFactory } from '@/utils/ids';
import { mapZodFieldErrors, type FieldErrors } from '@/utils/validation';

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;

export type CreateDeckInput = {
  collectionId: string;
  name: string;
  description?: string;
  autoGenerateReverseCards: boolean;
};

export type CreateDeckField = keyof CreateDeckInput;

type CreateDeckOptions = {
  deckRepository: DeckRepository;
  collectionRepository: CollectionRepository;
  idFactory?: IdFactory;
  now?: () => Date;
};

const createDeckSchema = z.object({
  collectionId: z.string().trim().min(1, 'Escolha uma coleção.'),
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

export class CreateDeckInputError extends Error {
  constructor(readonly fieldErrors: FieldErrors<CreateDeckField>) {
    super('Dados inválidos para criar deck.');
    this.name = 'CreateDeckInputError';
  }
}

export function isCreateDeckInputError(error: unknown): error is CreateDeckInputError {
  return error instanceof CreateDeckInputError;
}

export async function createDeck(
  input: CreateDeckInput,
  {
    deckRepository,
    collectionRepository,
    idFactory = () => createLocalId('deck'),
    now = () => new Date(),
  }: CreateDeckOptions,
): Promise<Deck> {
  const parsed = createDeckSchema.safeParse(input);

  if (!parsed.success) {
    throw new CreateDeckInputError(mapZodFieldErrors<CreateDeckField>(parsed.error.issues));
  }

  const parentCollection = await collectionRepository.findById(parsed.data.collectionId);

  if (!parentCollection) {
    throw new CreateDeckInputError({
      collectionId: 'Escolha uma coleção existente.',
    });
  }

  const timestamp = now().toISOString();
  const deck: Deck = {
    id: idFactory(),
    collectionId: parsed.data.collectionId,
    name: parsed.data.name,
    description: parsed.data.description || undefined,
    autoGenerateReverseCards: parsed.data.autoGenerateReverseCards,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return deckRepository.create(deck);
}
