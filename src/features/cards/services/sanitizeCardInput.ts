import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import { LIMITS } from '@/constants/limits';
import {
  composeClozeBack,
  composeClozeFront,
  validateClozeContent,
  type ClozeContent,
} from '@/domain/cloze/clozeContent';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide, type MediaType } from '@/domain/entities/Media';
import type { Tag } from '@/domain/entities/Tag';
import { normalizeTagKey, normalizeTagName } from '@/utils/normalizeText';
import type { FieldErrors } from '@/utils/validation';

const MAX_TEXT_LENGTH = 2000;
const MAX_NOTES_LENGTH = 1000;
const { MAX_TAGS, MAX_TAG_LENGTH } = LIMITS;

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

export type CardContentInput = {
  type: CardType;
  frontText?: string;
  backText?: string;
  /** Conteúdo estruturado do cloze (§9). Para `type === 'cloze'`, é a fonte de frente/verso. */
  cloze?: ClozeContent;
  notes?: string;
  tags?: string[];
  media?: CreateCardMediaInput[];
};

export type CardContentField =
  | 'type'
  | 'frontText'
  | 'backText'
  | 'frontMedia'
  | 'backMedia'
  | 'tags'
  | 'notes';

export type SanitizedCardContent = {
  type: CardType;
  frontText: string;
  backText: string;
  cloze?: ClozeContent;
  notes?: string;
  tags: Tag[];
  media: CreateCardMediaInput[];
};

export function isCardType(value: string): value is CardType {
  return Object.values(CARD_TYPES).includes(value as CardType);
}

function trimText(value: string | undefined): string {
  return value?.trim() ?? '';
}

function hasText(value: string): boolean {
  return value.length > 0;
}

function hasSideMedia(media: readonly CreateCardMediaInput[], side: MediaSide): boolean {
  return media.some((item) => item.side === side);
}

function hasSideAudioLikeMedia(media: readonly CreateCardMediaInput[], side: MediaSide): boolean {
  return media.some((item) => item.side === side && audioLikeMediaTypes.has(item.type));
}

function hasImageMedia(media: readonly CreateCardMediaInput[]): boolean {
  return media.some((item) => item.type === MEDIA_TYPES.IMAGE);
}

function hasBackMedia(media: readonly CreateCardMediaInput[]): boolean {
  return media.some((item) => item.side === MEDIA_SIDES.BACK);
}

function sideTextField(side: MediaSide): 'frontText' | 'backText' {
  return side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText';
}

function sideMediaField(side: MediaSide): 'frontMedia' | 'backMedia' {
  return side === MEDIA_SIDES.FRONT ? 'frontMedia' : 'backMedia';
}

/**
 * Validação/normalização compartilhada do conteúdo de um card (regras por tipo,
 * mídia, tags). Usada por `createCard` e `updateCard` para evitar divergência.
 */
export function sanitizeCardContent(
  input: CardContentInput,
  collectionId: string,
  timestamp: string,
  idFactory: (prefix: string) => string,
): { data?: SanitizedCardContent; fieldErrors: FieldErrors<CardContentField> } {
  const fieldErrors: FieldErrors<CardContentField> = {};
  const type = trimText(input.type);
  const isCloze = type === CARD_TYPES.CLOZE;
  // Para cloze, a frente/verso são DERIVADAS do conteúdo estruturado (a frente com `{dica}`
  // por lacuna; o verso com a resposta primária por lacuna). Demais tipos usam o texto cru.
  const clozeContent = isCloze ? input.cloze : undefined;
  const frontText = clozeContent ? composeClozeFront(clozeContent) : trimText(input.frontText);
  const backText = clozeContent ? composeClozeBack(clozeContent) : trimText(input.backText);
  const notes = trimText(input.notes);
  const media = input.media ?? [];

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

  // Escuta e Pronúncia validam os dois lados em blocos próprios (transcrição / áudio modelo).
  // Cloze valida o conteúdo estruturado no bloco dedicado abaixo (frente/verso são derivadas).
  const backIsUsed = type !== CARD_TYPES.LISTENING && type !== CARD_TYPES.PRONUNCIATION;
  const hasFrontContent = hasText(frontText) || hasSideMedia(media, MEDIA_SIDES.FRONT);
  const hasBackContent = hasText(backText) || hasSideMedia(media, MEDIA_SIDES.BACK);

  if (!isCloze && !hasFrontContent) {
    fieldErrors.frontText = 'Informe texto ou midia para a frente.';
  }

  if (!isCloze && backIsUsed && !hasBackContent) {
    fieldErrors.backText = 'Informe texto ou midia para o verso.';
  }

  if (type === CARD_TYPES.CLOZE) {
    if (media.length > 0) {
      fieldErrors.frontMedia = 'Preencher lacuna aceita apenas texto.';
      fieldErrors.backMedia = 'Preencher lacuna aceita apenas texto.';
    }

    const clozeError = clozeContent ? validateClozeContent(clozeContent) : 'no-blanks';

    if (clozeError === 'no-blanks') {
      fieldErrors.frontText = 'Marque ao menos uma lacuna na frase.';
    } else if (clozeError === 'blank-without-answer') {
      fieldErrors.backText = 'Cada lacuna precisa de ao menos uma resposta aceita.';
    }
  }

  if (type === CARD_TYPES.VOCABULARY && hasBackMedia(media)) {
    fieldErrors.backMedia = 'Verso do vocabulario aceita apenas texto.';
  }

  if (type === CARD_TYPES.LISTENING) {
    if (hasImageMedia(media)) {
      fieldErrors.frontMedia = 'Escuta nao aceita imagem.';
    }

    if (!hasSideAudioLikeMedia(media, MEDIA_SIDES.FRONT)) {
      fieldErrors.frontMedia = 'Adicione audio, gravacao ou TTS na frente.';
    }

    if (hasBackMedia(media)) {
      fieldErrors.backMedia = 'O verso da escuta usa apenas texto.';
    }

    if (!hasText(backText)) {
      fieldErrors.backText = 'Escreva a transcricao da frase no verso.';
    }
  }

  if (type === CARD_TYPES.TYPING) {
    // A frente é sempre uma mídia (áudio/gravação/TTS ou imagem); o verso é a resposta digitada.
    if (hasBackMedia(media)) {
      fieldErrors.backMedia = 'Use texto no verso do card de escrita.';
    }

    if (!hasSideMedia(media, MEDIA_SIDES.FRONT)) {
      fieldErrors.frontMedia = 'Escolha o conteudo da frente (audio, TTS ou imagem).';
    }

    if (!hasText(backText)) {
      fieldErrors.backText = 'Informe a resposta esperada.';
    }
  }

  if (type === CARD_TYPES.PRONUNCIATION) {
    if (hasImageMedia(media)) {
      fieldErrors.backMedia = 'Pronuncia nao aceita imagem.';
    }

    if (hasSideMedia(media, MEDIA_SIDES.FRONT)) {
      fieldErrors.frontMedia = 'A frente da pronuncia usa apenas texto.';
    }

    if (!hasText(frontText)) {
      fieldErrors.frontText = 'Informe o texto para pronunciar na frente.';
    }

    if (!hasSideAudioLikeMedia(media, MEDIA_SIDES.BACK)) {
      fieldErrors.backMedia = 'Adicione audio, gravacao ou TTS no verso.';
    }
  }

  const tags = Array.from(normalizedTagMap.entries()).map<Tag>(([normalizedName, name]) => ({
    id: idFactory('tag'),
    collectionId,
    name,
    normalizedName,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  return {
    data: {
      type,
      frontText,
      backText,
      cloze: clozeContent,
      notes: notes || undefined,
      tags,
      media,
    },
    fieldErrors,
  };
}
