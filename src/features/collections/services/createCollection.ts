import { z } from 'zod';

import { LANGUAGES, type LanguageCode } from '@/constants/languages';
import type { Collection } from '@/domain/entities/Collection';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import { createLocalId, type IdFactory } from '@/utils/ids';
import { mapZodFieldErrors, type FieldErrors } from '@/utils/validation';

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;

export type CreateCollectionInput = {
  name: string;
  baseLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  description?: string;
};

export type CreateCollectionField = keyof CreateCollectionInput;

type CreateCollectionOptions = {
  repository: CollectionRepository;
  idFactory?: IdFactory;
  now?: () => Date;
};

const languageCodeSchema = z.custom<LanguageCode>(
  (value) => LANGUAGES.some((language) => language.code === value),
  { message: 'Escolha um idioma da lista.' },
);

const createCollectionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe o nome da coleção.')
      .max(MAX_NAME_LENGTH, `Use no máximo ${MAX_NAME_LENGTH} caracteres.`),
    baseLanguage: languageCodeSchema,
    targetLanguage: languageCodeSchema,
    description: z
      .string()
      .trim()
      .max(MAX_DESCRIPTION_LENGTH, `Use no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`)
      .optional(),
  })
  .refine((value) => value.baseLanguage !== value.targetLanguage, {
    path: ['targetLanguage'],
    message: 'O idioma alvo deve ser diferente do idioma base.',
  });

export class CreateCollectionInputError extends Error {
  constructor(readonly fieldErrors: FieldErrors<CreateCollectionField>) {
    super('Dados inválidos para criar coleção.');
    this.name = 'CreateCollectionInputError';
  }
}

export function isCreateCollectionInputError(error: unknown): error is CreateCollectionInputError {
  return error instanceof CreateCollectionInputError;
}

export async function createCollection(
  input: CreateCollectionInput,
  {
    repository,
    idFactory = () => createLocalId('collection'),
    now = () => new Date(),
  }: CreateCollectionOptions,
): Promise<Collection> {
  const parsed = createCollectionSchema.safeParse(input);

  if (!parsed.success) {
    throw new CreateCollectionInputError(
      mapZodFieldErrors<CreateCollectionField>(parsed.error.issues),
    );
  }

  const activeCollections = await repository.listActive();
  const hasDuplicateLanguagePair = activeCollections.some(
    (collection) =>
      collection.baseLanguage === parsed.data.baseLanguage &&
      collection.targetLanguage === parsed.data.targetLanguage,
  );

  if (hasDuplicateLanguagePair) {
    throw new CreateCollectionInputError({
      targetLanguage: 'Já existe uma coleção com este par de idiomas.',
    });
  }

  const timestamp = now().toISOString();
  const collection: Collection = {
    id: idFactory(),
    name: parsed.data.name,
    baseLanguage: parsed.data.baseLanguage,
    targetLanguage: parsed.data.targetLanguage,
    description: parsed.data.description || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return repository.create(collection);
}
