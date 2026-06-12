import { type CardType } from '@/constants/cardTypes';
import type { ClozeContent } from '@/domain/cloze/clozeContent';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';
import type { LocalMediaStorage } from '@/domain/services/LocalMediaStorage';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import type { Media } from '@/domain/entities/Media';
import { VARIANT_TYPES } from '@/domain/entities/CardVariant';
import type { CardVariant } from '@/domain/entities/CardVariant';
import { INITIAL_REVIEW_ITEM_STATE } from '@/domain/constants/initialReviewItemState';
import { createLocalId } from '@/utils/ids';
import type { FieldErrors } from '@/utils/validation';

import {
  sanitizeCardContent,
  type CardContentField,
  type CreateCardMediaInput,
} from './sanitizeCardInput';

export type {
  CreateCardFileMediaInput,
  CreateCardTtsMediaInput,
  CreateCardMediaInput,
} from './sanitizeCardInput';

const TTS_MIME_TYPE = 'application/x-tts';

export type CreateCardInput = {
  collectionId: string;
  deckId: string;
  type: CardType;
  frontText?: string;
  backText?: string;
  /** Conteúdo estruturado do cloze (§9): fonte de frente/verso para `type === 'cloze'`. */
  cloze?: ClozeContent;
  notes?: string;
  tags?: string[];
  media?: CreateCardMediaInput[];
};

export type CreateCardField = 'collectionId' | 'deckId' | CardContentField;

type CreateCardOptions = {
  cardRepository: CardRepository;
  collectionRepository: CollectionRepository;
  deckRepository: DeckRepository;
  mediaStorage: LocalMediaStorage;
  idFactory?: (prefix: string) => string;
  now?: () => Date;
};

export class CreateCardInputError extends Error {
  constructor(readonly fieldErrors: FieldErrors<CreateCardField>) {
    super('Dados invalidos para criar card.');
    this.name = 'CreateCardInputError';
  }
}

export function isCreateCardInputError(error: unknown): error is CreateCardInputError {
  return error instanceof CreateCardInputError;
}

function createReviewItem(
  cardVariantId: string,
  timestamp: string,
  idFactory: (prefix: string) => string,
) {
  return {
    id: idFactory('review-item'),
    cardVariantId,
    ...INITIAL_REVIEW_ITEM_STATE,
    nextReviewAt: timestamp,
    lastReviewedAt: undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createCard(
  input: CreateCardInput,
  {
    cardRepository,
    collectionRepository,
    deckRepository,
    mediaStorage,
    idFactory = createLocalId,
    now = () => new Date(),
  }: CreateCardOptions,
): Promise<CardAggregate> {
  const timestamp = now().toISOString();
  const collectionId = input.collectionId?.trim() ?? '';
  const deckId = input.deckId?.trim() ?? '';
  const sanitized = sanitizeCardContent(input, collectionId, timestamp, idFactory);
  const fieldErrors: FieldErrors<CreateCardField> = { ...sanitized.fieldErrors };

  if (!collectionId) {
    fieldErrors.collectionId = 'Escolha uma colecao.';
  }

  if (!deckId) {
    fieldErrors.deckId = 'Escolha um deck.';
  }

  if (Object.keys(fieldErrors).length > 0 || !sanitized.data) {
    throw new CreateCardInputError(fieldErrors);
  }

  const [collection, deck] = await Promise.all([
    collectionRepository.findById(collectionId),
    deckRepository.findById(deckId),
  ]);

  if (!collection) {
    throw new CreateCardInputError({ collectionId: 'Escolha uma colecao existente.' });
  }

  if (!deck) {
    throw new CreateCardInputError({ deckId: 'Escolha um deck existente.' });
  }

  if (deck.collectionId !== collection.id) {
    throw new CreateCardInputError({ deckId: 'Escolha um deck desta colecao.' });
  }

  const cardId = idFactory('card');
  const copiedUris: string[] = [];

  try {
    const media: Media[] = [];

    for (const item of sanitized.data.media) {
      const mediaId = idFactory('media');

      if (item.type === MEDIA_TYPES.TTS) {
        media.push({
          id: mediaId,
          cardId,
          side: item.side,
          type: MEDIA_TYPES.TTS,
          uri: `tts://local/${encodeURIComponent(item.language)}/${item.side}`,
          mimeType: TTS_MIME_TYPE,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        continue;
      }

      const copied = await mediaStorage.copyToCard({
        cardId,
        mediaId,
        side: item.side,
        type: item.type,
        sourceUri: item.uri,
        mimeType: item.mimeType,
        fileName: item.fileName,
      });
      copiedUris.push(copied.uri);
      media.push({
        id: mediaId,
        cardId,
        side: item.side,
        type: item.type,
        uri: copied.uri,
        mimeType: copied.mimeType,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    const originalVariant = {
      id: idFactory('card-variant'),
      cardId,
      variantType: VARIANT_TYPES.ORIGINAL,
      isGenerated: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const variants: CardVariant[] = [originalVariant];

    if (deck.autoGenerateReverseCards) {
      variants.push({
        id: idFactory('card-variant'),
        cardId,
        variantType: VARIANT_TYPES.REVERSE,
        isGenerated: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    const aggregate: CardAggregate = {
      card: {
        id: cardId,
        deckId,
        type: sanitized.data.type,
        front: sanitized.data.frontText,
        back: sanitized.data.backText,
        ...(sanitized.data.cloze ? { cloze: sanitized.data.cloze } : {}),
        notes: sanitized.data.notes,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      variants,
      media,
      tags: sanitized.data.tags,
      reviewItems: variants.map((variant) => createReviewItem(variant.id, timestamp, idFactory)),
    };

    return await cardRepository.createAggregate(aggregate);
  } catch (error) {
    await mediaStorage.deleteMany(copiedUris);
    throw error;
  }
}
