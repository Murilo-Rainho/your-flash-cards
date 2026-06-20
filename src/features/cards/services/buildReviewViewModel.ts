import type {
  CardFaceViewModel,
  FlashcardViewModel,
  ReviewAnswerBehavior,
} from '@/components/review';
import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import type { TtsPlaybackSpeed } from '@/constants/tts';
import { normalizeStudyAnswer } from '@/domain/cloze/cloze';
import {
  composeClozeBack,
  composeClozeBackWithAnswers,
  composeClozeFront,
  checkClozeBlankAnswer,
  getAcceptedClozeAnswers,
  getClozeBlanks,
  type ClozeContent,
} from '@/domain/cloze/clozeContent';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide } from '@/domain/entities/Media';
import type { StringCatalog } from '@/strings/types';

import type { CreateCardMediaInput } from './createCard';

/** Test recording state/handlers (pronunciation), injected by the feature. */
export type ReviewRecordingControls = {
  isRecording: boolean;
  recordedUri: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: () => void;
};

/** Card data (form state) + callbacks to build the review view-model. */
export type ReviewSource = {
  type: CardType;
  frontText: string;
  backText: string;
  cloze: ClozeContent;
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
 * Builds the audio affordance for one side: prioritizes file media (audio/recording),
 * then materialized TTS, and finally a live TTS fallback (when the side is inherently
 * audio-driven and no TTS media exists yet — Listening/Pronunciation in TTS mode,
 * which only becomes media on save).
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

/** Label for each blank field: 1 blank keeps the current prompt; N use "Blank i". */
function clozeBlankLabel(
  answerStrings: StringCatalog['review']['answer'],
  total: number,
  index: number,
): string {
  return total <= 1 ? answerStrings.clozePrompt : `${answerStrings.clozeBlankLabel} ${index + 1}`;
}

/**
 * Builds the `FlashcardViewModel` (domain-agnostic) from form state.
 * Same conceptual function the future review flow will use from a persisted `CardAggregate`.
 * Best-effort: empty fields become `undefined` (no error thrown).
 */
export function buildReviewViewModel(source: ReviewSource): FlashcardViewModel {
  const { type, frontText, backText, frontMedia } = source;

  if (type === CARD_TYPES.CLOZE) {
    const content = source.cloze;
    const blanks = getClozeBlanks(content);
    const display = composeClozeFront(content);
    const back = composeClozeBack(content);

    const answer: ReviewAnswerBehavior = {
      kind: 'cloze',
      blanks: blanks.map((blank, index) => ({
        label: clozeBlankLabel(source.reviewStrings.answer, blanks.length, index),
        acceptedAnswers: getAcceptedClozeAnswers(blank.answers),
        checkAnswer: (typed: string) => checkClozeBlankAnswer(blank.answers, typed),
      })),
      composeBackText: (answersByBlank) => composeClozeBackWithAnswers(content, answersByBlank),
    };

    return {
      cardType: type,
      front: { text: toUndefined(display) },
      back: { text: toUndefined(back) },
      answer,
    };
  }

  if (type === CARD_TYPES.TYPING) {
    // Typing (§11): front is media (audio/recording/TTS or image) — never text, which
    // only exists as the TTS source (live fallback in preview). The reviewer types the answer,
    // compared locally (normalized) against the back; final rating remains manual.
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
    // Inverse of Listening: front shows text to pronounce and records the user's voice; model
    // audio (back) only appears on flip, to compare with the user's recording.
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
    // Audio stays on the front; on the back it is replayed (same affordance) alongside
    // the transcription (back) and the user's attempt (compared if typed).
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

  // CARD_TYPES.VOCABULARY (default): text/image/audio on front, text on back.
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
