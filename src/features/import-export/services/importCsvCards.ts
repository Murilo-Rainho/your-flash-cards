import { CARD_TYPES } from '@/constants/cardTypes';
import { toSpeechLanguage } from '@/constants/languages';
import { clozeContentFromLegacy } from '@/domain/cloze/clozeContent';
import type { Deck } from '@/domain/entities/Deck';
import { MEDIA_SIDES, MEDIA_TYPES } from '@/domain/entities/Media';
import type { ParsedImportCard } from '@/domain/importers/DeckImporter';
import type { CardRepository } from '@/domain/repositories/CardRepository';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type { LocalMediaStorage } from '@/domain/services/LocalMediaStorage';
import {
  createCard,
  isCreateCardInputError,
  type CreateCardInput,
  type CreateCardMediaInput,
} from '@/features/cards/services/createCard';
import { createDeck } from '@/features/decks/services/createDeck';

/** Stable reason codes for cards that could not be saved (localized in the UI). */
export const IMPORT_SAVE_REASONS = {
  CARD_INVALID: 'card-invalid',
  CARD_ERROR: 'card-error',
} as const;

export class ImportCollectionNotFoundError extends Error {
  constructor(readonly collectionId: string) {
    super(`Collection not found: ${collectionId}`);
    this.name = 'ImportCollectionNotFoundError';
  }
}

export type ImportCardSkip = {
  rowNumber: number;
  reason: string;
};

export type ImportCardsResult = {
  imported: number;
  skipped: ImportCardSkip[];
  /** File-media references (images/audio paths) skipped because the ZIP is not imported yet. */
  mediaSkipped: number;
};

export type ImportCardsInput = {
  collectionId: string;
  cards: readonly ParsedImportCard[];
  commonTags?: readonly string[];
};

type ImportCardsOptions = {
  collectionRepository: CollectionRepository;
  deckRepository: DeckRepository;
  cardRepository: CardRepository;
  mediaStorage: LocalMediaStorage;
  /** Fallback deck name (localized) used when a row has no deck. */
  defaultDeckName: string;
};

function deckKey(name: string): string {
  return name.trim().toLowerCase();
}

function buildTtsMedia(
  card: ParsedImportCard,
  frontLanguage: string,
  backLanguage: string,
): CreateCardMediaInput[] {
  const media: CreateCardMediaInput[] = [];

  if (card.ttsFront !== undefined) {
    media.push({
      side: MEDIA_SIDES.FRONT,
      type: MEDIA_TYPES.TTS,
      language: card.ttsFront || frontLanguage,
    });
  }

  if (card.ttsBack !== undefined) {
    media.push({
      side: MEDIA_SIDES.BACK,
      type: MEDIA_TYPES.TTS,
      language: card.ttsBack || backLanguage,
    });
  }

  return media;
}

/**
 * Persists parsed CSV cards into an existing collection (§16): decks are matched/created by name;
 * each card is created via `createCard`. Best-effort (§25): a single invalid card never aborts the
 * batch — it is reported in `skipped`. File media references require the future ZIP, so they are
 * skipped and counted in `mediaSkipped`.
 */
export async function importCsvCards(
  { collectionId, cards, commonTags = [] }: ImportCardsInput,
  {
    collectionRepository,
    deckRepository,
    cardRepository,
    mediaStorage,
    defaultDeckName,
  }: ImportCardsOptions,
): Promise<ImportCardsResult> {
  const collection = await collectionRepository.findById(collectionId);

  if (!collection) {
    throw new ImportCollectionNotFoundError(collectionId);
  }

  const existingDecks = await deckRepository.listActiveByCollection(collectionId);
  const deckByName = new Map<string, Deck>();

  for (const deck of existingDecks) {
    deckByName.set(deckKey(deck.name), deck);
  }

  const frontTtsLanguage = toSpeechLanguage(collection.targetLanguage);
  const backTtsLanguage = toSpeechLanguage(collection.baseLanguage);

  const resolveDeck = async (rawName: string): Promise<Deck> => {
    const name = rawName.trim() || defaultDeckName;
    const key = deckKey(name);
    const existing = deckByName.get(key);

    if (existing) {
      return existing;
    }

    const created = await createDeck(
      { collectionId, name, autoGenerateReverseCards: false },
      { deckRepository, collectionRepository },
    );
    deckByName.set(key, created);
    return created;
  };

  const skipped: ImportCardSkip[] = [];
  let imported = 0;
  let mediaSkipped = 0;

  for (const card of cards) {
    try {
      const deck = await resolveDeck(card.deck);
      const isCloze = card.type === CARD_TYPES.CLOZE;

      const input: CreateCardInput = {
        collectionId,
        deckId: deck.id,
        type: card.type,
        frontText: isCloze ? undefined : card.front,
        backText: isCloze ? undefined : card.back,
        cloze: isCloze ? clozeContentFromLegacy(card.front, card.back) : undefined,
        notes: card.notes,
        tags: [...card.tags, ...commonTags],
        media: buildTtsMedia(card, frontTtsLanguage, backTtsLanguage),
      };

      await createCard(input, {
        cardRepository,
        collectionRepository,
        deckRepository,
        mediaStorage,
      });

      mediaSkipped += card.fileMediaRefs.length;
      imported += 1;
    } catch (error) {
      skipped.push({
        rowNumber: card.rowNumber,
        reason: isCreateCardInputError(error)
          ? IMPORT_SAVE_REASONS.CARD_INVALID
          : IMPORT_SAVE_REASONS.CARD_ERROR,
      });
    }
  }

  return { imported, skipped, mediaSkipped };
}
