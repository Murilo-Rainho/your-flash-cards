import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import { toSpeechLanguage } from '@/constants/languages';
import { extractExpectedClozeAnswer, parseClozeFront } from '@/domain/cloze/cloze';
import type { Collection } from '@/domain/entities/Collection';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide } from '@/domain/entities/Media';
import type { CardAggregate } from '@/domain/repositories/CardRepository';

import { LISTENING_INPUT_MODES, type ListeningInputMode } from '../config/listeningInputMode';
import { TYPING_FRONT_MODES, type TypingFrontMode } from '../config/typingFrontMode';
import { VOCABULARY_FRONT_MODES, type VocabularyFrontMode } from '../config/vocabularyFrontMode';
import type { CreateCardMediaInput } from './sanitizeCardInput';

type ClozeParts = { before: string; gap: string; after: string };

export type EditCardPrefill = {
  frontText: string;
  backText: string;
  cloze: { front: ClozeParts; back: ClozeParts };
  tags: string[];
  notes: string;
  media: CreateCardMediaInput[];
  listeningModes: Record<MediaSide, ListeningInputMode>;
  vocabularyFrontMode: VocabularyFrontMode;
  typingFrontMode: TypingFrontMode;
  ttsLanguages: Record<MediaSide, string>;
};

const emptyCloze: ClozeParts = { before: '', gap: '', after: '' };

function parseTtsLanguage(uri: string): string | null {
  const match = /^tts:\/\/local\/([^/]+)\//.exec(uri);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function mapAggregateMedia(aggregate: CardAggregate): CreateCardMediaInput[] {
  return aggregate.media.map((media) => {
    if (media.type === MEDIA_TYPES.TTS) {
      return {
        side: media.side,
        type: MEDIA_TYPES.TTS,
        language: parseTtsLanguage(media.uri) ?? 'en-US',
      };
    }

    return {
      side: media.side,
      type: media.type,
      uri: media.uri,
      mimeType: media.mimeType,
    };
  });
}

function listeningModeForSide(media: CreateCardMediaInput[], side: MediaSide): ListeningInputMode {
  const sideMedia = media.filter((item) => item.side === side);

  if (sideMedia.some((item) => item.type === MEDIA_TYPES.TTS)) {
    return LISTENING_INPUT_MODES.TTS;
  }

  if (sideMedia.some((item) => item.type === MEDIA_TYPES.RECORDING)) {
    return LISTENING_INPUT_MODES.RECORDING;
  }

  return LISTENING_INPUT_MODES.AUDIO_FILE;
}

function vocabularyFrontModeFor(media: CreateCardMediaInput[]): VocabularyFrontMode {
  const frontMedia = media.filter((item) => item.side === MEDIA_SIDES.FRONT);

  if (frontMedia.some((item) => item.type === MEDIA_TYPES.IMAGE)) {
    return VOCABULARY_FRONT_MODES.IMAGE;
  }

  if (frontMedia.length > 0) {
    return VOCABULARY_FRONT_MODES.AUDIO;
  }

  return VOCABULARY_FRONT_MODES.TEXT;
}

function typingFrontModeFor(media: CreateCardMediaInput[]): TypingFrontMode {
  const frontMedia = media.filter((item) => item.side === MEDIA_SIDES.FRONT);

  if (frontMedia.some((item) => item.type === MEDIA_TYPES.IMAGE)) {
    return TYPING_FRONT_MODES.IMAGE_GALLERY;
  }

  if (frontMedia.some((item) => item.type === MEDIA_TYPES.TTS)) {
    return TYPING_FRONT_MODES.TTS;
  }

  if (frontMedia.some((item) => item.type === MEDIA_TYPES.RECORDING)) {
    return TYPING_FRONT_MODES.RECORDING;
  }

  return TYPING_FRONT_MODES.AUDIO_FILE;
}

/**
 * Constrói o estado inicial do formulário de edição a partir do aggregate carregado:
 * mapeia mídia, infere os "modos" de cada layout e separa as partes do cloze.
 */
export function deriveEditCardPrefill(
  aggregate: CardAggregate,
  collection?: Collection | null,
): EditCardPrefill {
  const { card } = aggregate;
  const type: CardType = card.type;
  const media = mapAggregateMedia(aggregate);

  let front: ClozeParts = emptyCloze;
  let back: ClozeParts = emptyCloze;

  if (type === CARD_TYPES.CLOZE) {
    const parsedFront = parseClozeFront(card.front);
    const before = parsedFront?.before.trim() ?? '';
    const after = parsedFront?.after.trim() ?? '';
    const frontGap = parsedFront?.gap ?? '';
    const backGap = extractExpectedClozeAnswer(card.front, card.back)?.trim() ?? '';
    front = { before, gap: frontGap, after };
    back = { before, gap: backGap, after };
  }

  const ttsLanguageFor = (side: MediaSide, fallback: string): string => {
    const ttsMedia = aggregate.media.find(
      (item) => item.side === side && item.type === MEDIA_TYPES.TTS,
    );
    return ttsMedia ? (parseTtsLanguage(ttsMedia.uri) ?? fallback) : fallback;
  };

  const frontDefault = collection ? toSpeechLanguage(collection.targetLanguage) : 'en-US';
  const backDefault = collection
    ? type === CARD_TYPES.PRONUNCIATION
      ? toSpeechLanguage(collection.targetLanguage)
      : toSpeechLanguage(collection.baseLanguage)
    : 'pt-BR';

  return {
    frontText: card.front,
    backText: card.back,
    cloze: { front, back },
    tags: aggregate.tags.map((tag) => tag.name),
    notes: card.notes ?? '',
    media,
    listeningModes: {
      front: listeningModeForSide(media, MEDIA_SIDES.FRONT),
      back: listeningModeForSide(media, MEDIA_SIDES.BACK),
    },
    vocabularyFrontMode: vocabularyFrontModeFor(media),
    typingFrontMode: typingFrontModeFor(media),
    ttsLanguages: {
      front: ttsLanguageFor(MEDIA_SIDES.FRONT, frontDefault),
      back: ttsLanguageFor(MEDIA_SIDES.BACK, backDefault),
    },
  };
}
