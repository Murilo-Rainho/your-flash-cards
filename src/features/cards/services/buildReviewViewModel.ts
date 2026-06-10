import type {
  CardFaceViewModel,
  FlashcardViewModel,
  ReviewAnswerBehavior,
} from '@/components/review';
import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import type { TtsPlaybackSpeed } from '@/constants/tts';
import {
  composeClozeBack,
  composeClozeFront,
  extractExpectedClozeAnswer,
  isClozeAnswerCorrect,
  normalizeStudyAnswer,
  toClozeDisplayFront,
} from '@/domain/cloze/cloze';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide } from '@/domain/entities/Media';
import type { StringCatalog } from '@/strings/types';

import type { CreateCardMediaInput } from './createCard';

type ClozeParts = { before: string; gap: string; after: string };

/** Estado/handlers da gravação de teste (pronúncia), injetados pela feature. */
export type ReviewRecordingControls = {
  isRecording: boolean;
  recordedUri: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: () => void;
};

/** Dados do card (estado do formulário) + callbacks p/ montar o view-model de revisão. */
export type ReviewSource = {
  type: CardType;
  frontText: string;
  backText: string;
  cloze: { front: ClozeParts; back: ClozeParts };
  frontMedia: readonly CreateCardMediaInput[];
  backMedia: readonly CreateCardMediaInput[];
  reviewStrings: StringCatalog['review'];
  onPlayAudio: (uri: string) => void;
  onSpeakTts: (side: MediaSide, speed: TtsPlaybackSpeed) => void;
  recording: ReviewRecordingControls;
};

function findImageUri(media: readonly CreateCardMediaInput[], side: MediaSide): string | undefined {
  const image = media.find((item) => item.side === side && item.type === MEDIA_TYPES.IMAGE);
  return image && image.type !== MEDIA_TYPES.TTS ? image.uri : undefined;
}

/**
 * Monta a afordância de áudio de um lado: prioriza mídia de arquivo (áudio/gravação),
 * depois TTS já materializado, e por fim um fallback de TTS "ao vivo" (quando o lado é
 * inerentemente sonoro e ainda não existe mídia TTS — caso de Escuta/Pronúncia em modo TTS,
 * que só vira mídia ao salvar).
 */
function buildAudioFace(
  side: MediaSide,
  media: readonly CreateCardMediaInput[],
  source: ReviewSource,
  ttsFallbackText?: string,
): CardFaceViewModel['audio'] {
  const file = media.find(
    (item) =>
      item.side === side &&
      (item.type === MEDIA_TYPES.AUDIO || item.type === MEDIA_TYPES.RECORDING),
  );

  if (file && file.type !== MEDIA_TYPES.TTS) {
    const uri = file.uri;
    return {
      type: 'audio',
      label: source.reviewStrings.face.playAudio,
      onPlay: () => source.onPlayAudio(uri),
    };
  }

  const hasTtsMedia = media.some((item) => item.side === side && item.type === MEDIA_TYPES.TTS);

  if (hasTtsMedia || ttsFallbackText?.trim()) {
    return {
      type: 'tts',
      label: source.reviewStrings.face.playTts,
      onPlay: (speed) => source.onSpeakTts(side, speed),
    };
  }

  return undefined;
}

function toUndefined(value: string): string | undefined {
  return value.trim() ? value : undefined;
}

/**
 * Constrói o `FlashcardViewModel` (agnóstico de domínio) a partir do estado do formulário.
 * É a mesma função conceitual que o futuro fluxo de revisão usará a partir de um
 * `CardAggregate` persistido. Best-effort: campos vazios viram `undefined` (sem lançar erro).
 */
export function buildReviewViewModel(source: ReviewSource): FlashcardViewModel {
  const { type, frontText, backText, frontMedia } = source;

  if (type === CARD_TYPES.CLOZE) {
    const composedFront = composeClozeFront(
      source.cloze.front.before,
      source.cloze.front.gap,
      source.cloze.front.after,
    );
    const composedBack = composeClozeBack(
      source.cloze.back.before,
      source.cloze.back.gap,
      source.cloze.back.after,
    );
    const display = composedFront ? (toClozeDisplayFront(composedFront) ?? composedFront) : '';

    const answer: ReviewAnswerBehavior = {
      kind: 'cloze',
      promptLabel: source.reviewStrings.answer.clozePrompt,
      checkAnswer: (typed: string) => {
        if (!composedFront || !composedBack) {
          return { correct: false, expected: '' };
        }
        return {
          correct: isClozeAnswerCorrect(typed, composedFront, composedBack),
          expected: extractExpectedClozeAnswer(composedFront, composedBack) ?? '',
        };
      },
    };

    return {
      cardType: type,
      front: { text: toUndefined(display) },
      back: { text: composedBack ? toUndefined(composedBack) : undefined },
      answer,
    };
  }

  if (type === CARD_TYPES.TYPING) {
    // Escrita (§11): a frente é uma mídia (áudio/gravação/TTS ou imagem) — nunca o texto, que
    // só existe como fonte do TTS (fallback ao vivo no preview). O revisor digita a resposta,
    // comparada localmente (normalizada) com o verso, com override manual no feedback.
    const answer: ReviewAnswerBehavior = {
      kind: 'typing',
      promptLabel: source.reviewStrings.answer.typingPrompt,
      checkAnswer: (typed: string) => ({
        correct: normalizeStudyAnswer(typed) === normalizeStudyAnswer(backText),
        expected: backText,
      }),
    };

    return {
      cardType: type,
      front: {
        imageUri: findImageUri(frontMedia, MEDIA_SIDES.FRONT),
        audio: buildAudioFace(MEDIA_SIDES.FRONT, frontMedia, source, frontText),
      },
      back: { text: toUndefined(backText) },
      answer,
    };
  }

  if (type === CARD_TYPES.PRONUNCIATION) {
    // Inverso da Escuta: a frente mostra o texto a pronunciar e grava a própria voz; o áudio
    // modelo (verso) só aparece ao virar, para comparar com a própria gravação.
    const modelAudio = buildAudioFace(MEDIA_SIDES.BACK, source.backMedia, source, frontText);

    return {
      cardType: type,
      front: { text: toUndefined(frontText) },
      back: { audio: modelAudio },
      answer: {
        kind: 'recording',
        isRecording: source.recording.isRecording,
        recordedUri: source.recording.recordedUri,
        onStartRecording: source.recording.onStartRecording,
        onStopRecording: source.recording.onStopRecording,
        onPlayRecording: source.recording.onPlayRecording,
      },
    };
  }

  if (type === CARD_TYPES.LISTENING) {
    // O áudio fica na frente; no verso ele é reouvido (mesma afordância) ao lado da
    // transcrição (verso) e da tentativa do usuário (comparada se digitada).
    const promptAudio = buildAudioFace(MEDIA_SIDES.FRONT, frontMedia, source, backText);

    return {
      cardType: type,
      front: { audio: promptAudio },
      back: { text: toUndefined(backText), audio: promptAudio },
      answer: {
        kind: 'listening',
        promptLabel: source.reviewStrings.answer.listeningPrompt,
        checkAnswer: (typed: string) => ({
          correct: normalizeStudyAnswer(typed) === normalizeStudyAnswer(backText),
          expected: backText,
        }),
        isRecording: source.recording.isRecording,
        recordedUri: source.recording.recordedUri,
        onStartRecording: source.recording.onStartRecording,
        onStopRecording: source.recording.onStopRecording,
        onPlayRecording: source.recording.onPlayRecording,
      },
    };
  }

  // CARD_TYPES.VOCABULARY (padrão): texto/imagem/áudio na frente, texto no verso.
  return {
    cardType: type,
    front: {
      text: toUndefined(frontText),
      imageUri: findImageUri(frontMedia, MEDIA_SIDES.FRONT),
      audio: buildAudioFace(MEDIA_SIDES.FRONT, frontMedia, source),
    },
    back: { text: toUndefined(backText) },
    answer: { kind: 'reveal' },
  };
}
