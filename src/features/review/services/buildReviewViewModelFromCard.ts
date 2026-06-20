import type {
  CardFaceViewModel,
  FlashcardViewModel,
  ReviewAnswerBehavior,
} from '@/components/review';
import { CARD_TYPES } from '@/constants/cardTypes';
import type { TtsPlaybackSpeed } from '@/constants/tts';
import { normalizeStudyAnswer } from '@/domain/cloze/cloze';
import {
  checkClozeBlankAnswer,
  composeClozeBackWithAnswers,
  composeClozeFront,
  getAcceptedClozeAnswers,
  getClozeBlanks,
  resolveClozeContent,
} from '@/domain/cloze/clozeContent';
import { VARIANT_TYPES } from '@/domain/entities/CardVariant';
import { MEDIA_SIDES, MEDIA_TYPES, type Media, type MediaSide } from '@/domain/entities/Media';
import type { DueReviewCard } from '@/domain/repositories/ReviewRepository';
import type { StringCatalog } from '@/strings/types';

/** Session recording state/handlers (pronunciation/listening), injected by the feature. */
export type ReviewRecordingControls = {
  isRecording: boolean;
  recordedUri: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: () => void;
};

export type BuildReviewViewModelFromCardSource = {
  card: DueReviewCard;
  reviewStrings: StringCatalog['review'];
  onPlayAudio: (uri: string) => void;
  onSpeakTts: (text: string, language: string, speed: TtsPlaybackSpeed) => void;
  currentlyPlayingUri?: string | null;
  recording: ReviewRecordingControls;
};

const TTS_URI_PREFIX = 'tts://local/';

/** Extracts language from persisted TTS media (`tts://local/{lang}/{side}`). */
function parseTtsLanguage(uri: string): string {
  if (!uri.startsWith(TTS_URI_PREFIX)) {
    return '';
  }
  const [encodedLanguage] = uri.slice(TTS_URI_PREFIX.length).split('/');
  if (!encodedLanguage) {
    return '';
  }
  try {
    return decodeURIComponent(encodedLanguage);
  } catch {
    return encodedLanguage;
  }
}

function toUndefined(value: string): string | undefined {
  return value.trim() ? value : undefined;
}

/** Per-blank field label: 1 blank keeps current prompt; N use "Blank i". */
function clozeBlankLabel(
  answerStrings: StringCatalog['review']['answer'],
  total: number,
  index: number,
): string {
  return total <= 1 ? answerStrings.clozePrompt : `${answerStrings.clozeBlankLabel} ${index + 1}`;
}

function findImageUri(media: readonly Media[], side: MediaSide): string | undefined {
  return media.find((item) => item.side === side && item.type === MEDIA_TYPES.IMAGE)?.uri;
}

/**
 * Builds audio affordance for one side: prefers file (audio/recording); if absent, uses
 * persisted TTS media — speaking `ttsText` (text meaningful for that type, chosen by caller,
 * same as form builder) in the language encoded in the uri.
 */
function buildAudioFace(
  side: MediaSide,
  media: readonly Media[],
  ttsText: string,
  source: BuildReviewViewModelFromCardSource,
): CardFaceViewModel['audio'] {
  const file = media.find(
    (item) =>
      item.side === side &&
      (item.type === MEDIA_TYPES.AUDIO || item.type === MEDIA_TYPES.RECORDING),
  );

  if (file) {
    const uri = file.uri;
    return {
      type: 'audio',
      label: source.reviewStrings.face.playAudio,
      onPlay: () => source.onPlayAudio(uri),
      isPlaying: source.currentlyPlayingUri === uri,
    };
  }

  const tts = media.find((item) => item.side === side && item.type === MEDIA_TYPES.TTS);

  if (tts) {
    const language = parseTtsLanguage(tts.uri);
    const text = ttsText.trim();
    return {
      type: 'tts',
      label: source.reviewStrings.face.playTts,
      onPlay: (speed) => source.onSpeakTts(text, language, speed),
    };
  }

  return undefined;
}

function buildRecordingBehavior(
  source: BuildReviewViewModelFromCardSource,
): Pick<
  Extract<ReviewAnswerBehavior, { kind: 'recording' }>,
  'isRecording' | 'recordedUri' | 'onStartRecording' | 'onStopRecording' | 'onPlayRecording'
> {
  return {
    isRecording: source.recording.isRecording,
    recordedUri: source.recording.recordedUri,
    onStartRecording: source.recording.onStartRecording,
    onStopRecording: source.recording.onStopRecording,
    onPlayRecording: source.recording.onPlayRecording,
  };
}

/**
 * Builds the domain-agnostic `FlashcardViewModel` from a PERSISTED card (`DueReviewCard`).
 * Analog of `buildReviewViewModel` (form-based): produces the SAME view-model consumed by
 * `FlashcardReview`, reusing cloze helpers.
 *
 * Reverse: ALWAYS treated as vocabulary/reveal with swapped sides. Inverted cloze/typing/listening/
 * pronunciation have no reliable offline checking, so V1 avoids fragile logic here.
 */
export function buildReviewViewModelFromCard(
  source: BuildReviewViewModelFromCardSource,
): FlashcardViewModel {
  const { card } = source;
  const { media } = card;

  if (card.variantType === VARIANT_TYPES.REVERSE) {
    return {
      cardType: card.cardType,
      front: { text: toUndefined(card.back) },
      back: {
        text: toUndefined(card.front),
        imageUri: findImageUri(media, MEDIA_SIDES.FRONT),
        audio: buildAudioFace(MEDIA_SIDES.FRONT, media, card.front, source),
      },
      answer: { kind: 'reveal' },
    };
  }

  if (card.cardType === CARD_TYPES.CLOZE) {
    // Works for new format (card.cloze) and legacy cards (front/back bridge).
    const content = resolveClozeContent(card);
    const blanks = getClozeBlanks(content);
    const display = composeClozeFront(content);
    return {
      cardType: card.cardType,
      front: { text: toUndefined(display || card.front) },
      back: { text: toUndefined(card.back) },
      answer: {
        kind: 'cloze',
        blanks: blanks.map((blank, index) => ({
          label: clozeBlankLabel(source.reviewStrings.answer, blanks.length, index),
          acceptedAnswers: getAcceptedClozeAnswers(blank.answers),
          checkAnswer: (typed: string) => checkClozeBlankAnswer(blank.answers, typed),
        })),
        composeBackText: (answersByBlank) => composeClozeBackWithAnswers(content, answersByBlank),
      },
    };
  }

  if (card.cardType === CARD_TYPES.TYPING) {
    return {
      cardType: card.cardType,
      front: {
        imageUri: findImageUri(media, MEDIA_SIDES.FRONT),
        audio: buildAudioFace(MEDIA_SIDES.FRONT, media, card.front, source),
      },
      back: { text: toUndefined(card.back) },
      answer: {
        kind: 'typing',
        promptLabel: source.reviewStrings.answer.typingPrompt,
        checkAnswer: (typed: string) => ({
          correct: normalizeStudyAnswer(typed) === normalizeStudyAnswer(card.back),
          expected: card.back,
        }),
      },
    };
  }

  if (card.cardType === CARD_TYPES.LISTENING) {
    // Front audio speaks the phrase (back transcript); replayed on back beside it.
    const promptAudio = buildAudioFace(MEDIA_SIDES.FRONT, media, card.back, source);
    return {
      cardType: card.cardType,
      front: { audio: promptAudio },
      back: { text: toUndefined(card.back), audio: promptAudio },
      answer: {
        kind: 'listening',
        promptLabel: source.reviewStrings.answer.listeningPrompt,
        checkAnswer: (typed: string) => ({
          correct: normalizeStudyAnswer(typed) === normalizeStudyAnswer(card.back),
          expected: card.back,
        }),
        ...buildRecordingBehavior(source),
      },
    };
  }

  if (card.cardType === CARD_TYPES.PRONUNCIATION) {
    // Back is model pronunciation audio for front text (so TTS speaks card.front).
    const modelAudio = buildAudioFace(MEDIA_SIDES.BACK, media, card.front, source);
    return {
      cardType: card.cardType,
      front: { text: toUndefined(card.front) },
      back: { audio: modelAudio },
      answer: { kind: 'recording', ...buildRecordingBehavior(source) },
    };
  }

  // VOCABULARY (default): text/image/audio on front, text on back, "reveal" answer.
  return {
    cardType: card.cardType,
    front: {
      text: toUndefined(card.front),
      imageUri: findImageUri(media, MEDIA_SIDES.FRONT),
      audio: buildAudioFace(MEDIA_SIDES.FRONT, media, card.front, source),
    },
    back: { text: toUndefined(card.back) },
    answer: { kind: 'reveal' },
  };
}
