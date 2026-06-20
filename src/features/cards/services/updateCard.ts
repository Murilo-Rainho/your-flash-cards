import type { ClozeContent } from '@/domain/cloze/clozeContent';
import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type { LocalMediaStorage } from '@/domain/services/LocalMediaStorage';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import type { Media } from '@/domain/entities/Media';
import { createLocalId } from '@/utils/ids';
import type { FieldErrors } from '@/utils/validation';

import {
  sanitizeCardContent,
  type CardContentField,
  type CreateCardMediaInput,
} from './sanitizeCardInput';

const TTS_MIME_TYPE = 'application/x-tts';

/**
 * Card edit. Type is immutable; deck may move only to another deck in the same collection
 * (changing collection would break the language contract).
 */
export type UpdateCardInput = {
  id: string;
  deckId: string;
  frontText?: string;
  backText?: string;
  /** Structured cloze content (§9): source of front/back for `cloze` cards. */
  cloze?: ClozeContent;
  notes?: string;
  tags?: string[];
  media?: CreateCardMediaInput[];
};

export type UpdateCardField = 'id' | 'deckId' | CardContentField;

type UpdateCardOptions = {
  cardRepository: CardRepository;
  deckRepository: DeckRepository;
  mediaStorage: LocalMediaStorage;
  idFactory?: (prefix: string) => string;
  now?: () => Date;
};

export class UpdateCardInputError extends Error {
  constructor(readonly fieldErrors: FieldErrors<UpdateCardField>) {
    super('Dados invalidos para editar card.');
    this.name = 'UpdateCardInputError';
  }
}

export function isUpdateCardInputError(error: unknown): error is UpdateCardInputError {
  return error instanceof UpdateCardInputError;
}

function ttsUri(language: string, side: string): string {
  return `tts://local/${encodeURIComponent(language)}/${side}`;
}

export async function updateCard(
  input: UpdateCardInput,
  {
    cardRepository,
    deckRepository,
    mediaStorage,
    idFactory = createLocalId,
    now = () => new Date(),
  }: UpdateCardOptions,
): Promise<CardAggregate> {
  const timestamp = now().toISOString();
  const cardId = input.id?.trim() ?? '';
  const deckId = input.deckId?.trim() ?? '';

  if (!cardId) {
    throw new UpdateCardInputError({ id: 'Card invalido.' });
  }

  const existing = await cardRepository.findAggregateById(cardId);

  if (!existing) {
    throw new UpdateCardInputError({ id: 'Card nao encontrado.' });
  }

  if (!deckId) {
    throw new UpdateCardInputError({ deckId: 'Escolha um deck.' });
  }

  const [currentDeck, targetDeck] = await Promise.all([
    deckRepository.findById(existing.card.deckId),
    deckRepository.findById(deckId),
  ]);

  if (!targetDeck) {
    throw new UpdateCardInputError({ deckId: 'Escolha um deck existente.' });
  }

  if (currentDeck && targetDeck.collectionId !== currentDeck.collectionId) {
    throw new UpdateCardInputError({ deckId: 'Escolha um deck desta colecao.' });
  }

  const sanitized = sanitizeCardContent(
    {
      type: existing.card.type,
      frontText: input.frontText,
      backText: input.backText,
      cloze: input.cloze,
      notes: input.notes,
      tags: input.tags,
      media: input.media,
    },
    targetDeck.collectionId,
    timestamp,
    idFactory,
  );
  const fieldErrors: FieldErrors<UpdateCardField> = { ...sanitized.fieldErrors };

  if (Object.keys(fieldErrors).length > 0 || !sanitized.data) {
    throw new UpdateCardInputError(fieldErrors);
  }

  const existingByUri = new Map(existing.media.map((media) => [media.uri, media]));
  const copiedUris: string[] = [];
  const finalMedia: Media[] = [];
  const keptUris = new Set<string>();

  try {
    for (const item of sanitized.data.media) {
      if (item.type === MEDIA_TYPES.TTS) {
        const uri = ttsUri(item.language, item.side);
        const persisted = existingByUri.get(uri);
        keptUris.add(uri);
        finalMedia.push({
          id: persisted?.id ?? idFactory('media'),
          cardId,
          side: item.side,
          type: MEDIA_TYPES.TTS,
          uri,
          mimeType: TTS_MIME_TYPE,
          createdAt: persisted?.createdAt ?? timestamp,
          updatedAt: timestamp,
        });
        continue;
      }

      const persisted = existingByUri.get(item.uri);

      if (persisted) {
        // Media already stored locally: keep file and id.
        keptUris.add(persisted.uri);
        finalMedia.push({ ...persisted, side: item.side, updatedAt: timestamp });
        continue;
      }

      const mediaId = idFactory('media');
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
      keptUris.add(copied.uri);
      finalMedia.push({
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

    const aggregate: CardAggregate = {
      card: {
        ...existing.card,
        deckId,
        front: sanitized.data.frontText,
        back: sanitized.data.backText,
        cloze: sanitized.data.cloze,
        notes: sanitized.data.notes,
        updatedAt: timestamp,
      },
      variants: existing.variants,
      media: finalMedia,
      tags: sanitized.data.tags,
      reviewItems: existing.reviewItems,
    };

    const saved = await cardRepository.updateAggregate(aggregate);

    // Remove media files no longer part of the card.
    const removedUris = existing.media
      .filter((media) => media.type !== MEDIA_TYPES.TTS && !keptUris.has(media.uri))
      .map((media) => media.uri);
    if (removedUris.length > 0) {
      await mediaStorage.deleteMany(removedUris);
    }

    return saved;
  } catch (error) {
    await mediaStorage.deleteMany(copiedUris);
    throw error;
  }
}
