import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';
import type { LocalMediaStorage } from '@/domain/services/LocalMediaStorage';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide, type MediaType } from '@/domain/entities/Media';
import type { Media } from '@/domain/entities/Media';
import { VARIANT_TYPES } from '@/domain/entities/CardVariant';
import type { CardVariant } from '@/domain/entities/CardVariant';
import type { Tag } from '@/domain/entities/Tag';
import { createLocalId } from '@/utils/ids';
import type { FieldErrors } from '@/utils/validation';

const MAX_TEXT_LENGTH = 2000;
const MAX_NOTES_LENGTH = 1000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 32;
const TTS_MIME_TYPE = 'application/x-tts';

const audioLikeMediaTypes: ReadonlySet<MediaType> = new Set([
  MEDIA_TYPES.AUDIO,
  MEDIA_TYPES.RECORDING,
  MEDIA_TYPES.TTS,
]);

export type CreateCardFileMediaInput = {
  side: MediaSide;
  type: Exclude<MediaType, 'tts'>;
  uri: string;
  mimeType: string;
  fileName?: string;
};

export type CreateCardTtsMediaInput = {
  side: MediaSide;
  type: typeof MEDIA_TYPES.TTS;
  language: string;
};

export type CreateCardMediaInput = CreateCardFileMediaInput | CreateCardTtsMediaInput;

export type CreateCardInput = {
  collectionId: string;
  deckId: string;
  type: CardType;
  frontText?: string;
  backText?: string;
  notes?: string;
  tags?: string[];
  media?: CreateCardMediaInput[];
};

export type CreateCardField =
  | 'collectionId'
  | 'deckId'
  | 'type'
  | 'frontText'
  | 'backText'
  | 'frontMedia'
  | 'backMedia'
  | 'tags'
  | 'notes';

type CreateCardOptions = {
  cardRepository: CardRepository;
  collectionRepository: CollectionRepository;
  deckRepository: DeckRepository;
  mediaStorage: LocalMediaStorage;
  idFactory?: (prefix: string) => string;
  now?: () => Date;
};

type SanitizedInput = {
  collectionId: string;
  deckId: string;
  type: CardType;
  frontText: string;
  backText: string;
  notes?: string;
  tags: Tag[];
  media: CreateCardMediaInput[];
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

function isCardType(value: string): value is CardType {
  return Object.values(CARD_TYPES).includes(value as CardType);
}

function trimText(value: string | undefined): string {
  return value?.trim() ?? '';
}

function hasText(value: string): boolean {
  return value.length > 0;
}

function normalizeTagName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeTagKey(value: string): string {
  return normalizeTagName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function hasSideMedia(media: readonly CreateCardMediaInput[], side: MediaSide): boolean {
  return media.some((item) => item.side === side);
}

function hasSideAudioLikeMedia(media: readonly CreateCardMediaInput[], side: MediaSide): boolean {
  return media.some((item) => item.side === side && audioLikeMediaTypes.has(item.type));
}

function hasSideRecordedOrAttachedAudio(
  media: readonly CreateCardMediaInput[],
  side: MediaSide,
): boolean {
  return media.some(
    (item) =>
      item.side === side &&
      (item.type === MEDIA_TYPES.AUDIO || item.type === MEDIA_TYPES.RECORDING),
  );
}

function hasImageMedia(media: readonly CreateCardMediaInput[]): boolean {
  return media.some((item) => item.type === MEDIA_TYPES.IMAGE);
}

function hasBackMedia(media: readonly CreateCardMediaInput[]): boolean {
  return media.some((item) => item.side === MEDIA_SIDES.BACK);
}

function hasClozeGap(value: string): boolean {
  return value.includes('____') || /\{[^{}]+\}/.test(value);
}

function sideTextField(side: MediaSide): 'frontText' | 'backText' {
  return side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText';
}

function sideMediaField(side: MediaSide): 'frontMedia' | 'backMedia' {
  return side === MEDIA_SIDES.FRONT ? 'frontMedia' : 'backMedia';
}

function createReviewItem(
  cardVariantId: string,
  timestamp: string,
  idFactory: (prefix: string) => string,
) {
  return {
    id: idFactory('review-item'),
    cardVariantId,
    schedulerType: 'sm2',
    schedulerVersion: 'v1',
    repetitions: 0,
    intervalDays: 0,
    easeFactor: 2.5,
    nextReviewAt: timestamp,
    lastReviewedAt: undefined,
    lapses: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function sanitizeInput(
  input: CreateCardInput,
  timestamp: string,
  idFactory: (prefix: string) => string,
): { data?: SanitizedInput; fieldErrors: FieldErrors<CreateCardField> } {
  const fieldErrors: FieldErrors<CreateCardField> = {};
  const collectionId = trimText(input.collectionId);
  const deckId = trimText(input.deckId);
  const type = trimText(input.type);
  const frontText = trimText(input.frontText);
  const backText = trimText(input.backText);
  const notes = trimText(input.notes);
  const media = input.media ?? [];

  if (!collectionId) {
    fieldErrors.collectionId = 'Escolha uma colecao.';
  }

  if (!deckId) {
    fieldErrors.deckId = 'Escolha um deck.';
  }

  if (!isCardType(type)) {
    fieldErrors.type = 'Escolha um tipo de card.';
  }

  if (frontText.length > MAX_TEXT_LENGTH) {
    fieldErrors.frontText = `Use no maximo ${MAX_TEXT_LENGTH} caracteres.`;
  }

  if (backText.length > MAX_TEXT_LENGTH) {
    fieldErrors.backText = `Use no maximo ${MAX_TEXT_LENGTH} caracteres.`;
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    fieldErrors.notes = `Use no maximo ${MAX_NOTES_LENGTH} caracteres.`;
  }

  for (const item of media) {
    if (item.side !== MEDIA_SIDES.FRONT && item.side !== MEDIA_SIDES.BACK) {
      fieldErrors.frontMedia = 'Midia com lado invalido.';
    }

    if (item.type !== MEDIA_TYPES.TTS && !trimText(item.uri)) {
      fieldErrors[sideMediaField(item.side)] = 'Arquivo de midia invalido.';
    }

    if (item.type !== MEDIA_TYPES.TTS && !trimText(item.mimeType)) {
      fieldErrors[sideMediaField(item.side)] = 'Tipo de midia invalido.';
    }

    if (item.type === MEDIA_TYPES.TTS) {
      const ttsText = item.side === MEDIA_SIDES.FRONT ? frontText : backText;

      if (!hasText(ttsText)) {
        fieldErrors[sideTextField(item.side)] = 'Informe texto para usar TTS local.';
      }

      if (!trimText(item.language)) {
        fieldErrors[sideMediaField(item.side)] = 'Idioma do TTS invalido.';
      }
    }
  }

  const normalizedTagMap = new Map<string, string>();
  for (const rawTag of input.tags ?? []) {
    const tagName = normalizeTagName(rawTag);

    if (!tagName) {
      continue;
    }

    if (tagName.length > MAX_TAG_LENGTH) {
      fieldErrors.tags = `Use tags com no maximo ${MAX_TAG_LENGTH} caracteres.`;
      continue;
    }

    normalizedTagMap.set(normalizeTagKey(tagName), tagName);
  }

  if (normalizedTagMap.size > MAX_TAGS) {
    fieldErrors.tags = `Use no maximo ${MAX_TAGS} tags por card.`;
  }

  if (!isCardType(type)) {
    return { fieldErrors };
  }

  const hasFrontContent = hasText(frontText) || hasSideMedia(media, MEDIA_SIDES.FRONT);
  const hasBackContent = hasText(backText) || hasSideMedia(media, MEDIA_SIDES.BACK);

  if (!hasFrontContent) {
    fieldErrors.frontText = 'Informe texto ou midia para a frente.';
  }

  if (!hasBackContent) {
    fieldErrors.backText = 'Informe texto ou midia para o verso.';
  }

  if (type === CARD_TYPES.CLOZE) {
    if (media.length > 0) {
      fieldErrors.frontMedia = 'Preencher lacuna aceita apenas texto.';
      fieldErrors.backMedia = 'Preencher lacuna aceita apenas texto.';
    }

    if (!hasText(frontText)) {
      fieldErrors.frontText = 'Informe a frase com lacuna.';
    } else if (!hasClozeGap(frontText)) {
      fieldErrors.frontText = 'Use ____ ou {resposta} para marcar a lacuna.';
    }

    if (!hasText(backText)) {
      fieldErrors.backText = 'Informe a resposta da lacuna.';
    }
  }

  if (type === CARD_TYPES.LISTENING) {
    if (hasImageMedia(media) || hasBackMedia(media)) {
      fieldErrors.frontMedia = 'Escuta aceita audio apenas na frente.';
      fieldErrors.backMedia = 'Use texto no verso do card de escuta.';
    }

    if (!hasSideAudioLikeMedia(media, MEDIA_SIDES.FRONT)) {
      fieldErrors.frontMedia = 'Adicione audio, gravacao ou TTS na frente.';
    }

    if (!hasText(backText)) {
      fieldErrors.backText = 'Informe a resposta ou significado no verso.';
    }
  }

  if (type === CARD_TYPES.TYPING) {
    if (hasImageMedia(media) || hasBackMedia(media)) {
      fieldErrors.frontMedia = 'Escrita aceita audio apenas na frente.';
      fieldErrors.backMedia = 'Use texto no verso do card de escrita.';
    }

    const hasTypingFrontContent =
      hasText(frontText) || hasSideAudioLikeMedia(media, MEDIA_SIDES.FRONT);

    if (!hasTypingFrontContent) {
      fieldErrors.frontText = 'Informe texto ou audio para a frente.';
    }

    if (!hasText(backText)) {
      fieldErrors.backText = 'Informe a resposta esperada.';
    }
  }

  if (type === CARD_TYPES.PRONUNCIATION) {
    if (hasText(frontText)) {
      fieldErrors.frontText = 'Use audio na frente do card de pronuncia.';
    }

    if (hasImageMedia(media)) {
      fieldErrors.frontMedia = 'Pronuncia nao aceita imagem.';
    }

    if (!hasSideRecordedOrAttachedAudio(media, MEDIA_SIDES.FRONT)) {
      fieldErrors.frontMedia = 'Adicione audio ou gravacao na frente.';
    }

    if (!hasText(backText)) {
      fieldErrors.backText = 'Informe o texto que sera falado no verso.';
    }
  }

  const tags = Array.from(normalizedTagMap.entries()).map<Tag>(([normalizedName, name]) => ({
    id: idFactory('tag'),
    name,
    normalizedName,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  return {
    data: {
      collectionId,
      deckId,
      type,
      frontText,
      backText,
      notes: notes || undefined,
      tags,
      media,
    },
    fieldErrors,
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
  const sanitized = sanitizeInput(input, timestamp, idFactory);

  if (Object.keys(sanitized.fieldErrors).length > 0 || !sanitized.data) {
    throw new CreateCardInputError(sanitized.fieldErrors);
  }

  const [collection, deck] = await Promise.all([
    collectionRepository.findById(sanitized.data.collectionId),
    deckRepository.findById(sanitized.data.deckId),
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
        deckId: sanitized.data.deckId,
        type: sanitized.data.type,
        front: sanitized.data.frontText,
        back: sanitized.data.backText,
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
