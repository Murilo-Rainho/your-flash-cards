import type { CardType } from '@/constants/cardTypes';
import type { ReviewRating } from '@/constants/reviewRatings';
import type { TtsPlaybackSpeed } from '@/constants/tts';
import type { StringCatalog } from '@/strings/types';

/**
 * View-model contract for the review component (`FlashcardReview`).
 *
 * IMPORTANT: this file is dumb UI (the `components/` layer). It does NOT import `domain/`,
 * `infrastructure/`, or `features/`. All rules (answer comparison, audio/TTS playback,
 * recording) are resolved in the `features/` layer and injected here as callbacks.
 */

type AudioAffordanceBase = {
  label: string;
  isPlaying?: boolean;
  accessibilityLabel?: string;
};

/** Generic audio affordance (local file or TTS). The component only triggers `onPlay`. */
export type AudioAffordance =
  | (AudioAffordanceBase & {
      type: 'audio';
      onPlay: () => void;
    })
  | (AudioAffordanceBase & {
      type: 'tts';
      onPlay: (speed: TtsPlaybackSpeed) => void;
    });

/** One side of the card (front or back). All optional — may be text-only, image-only, or audio-only. */
export type CardFaceViewModel = {
  text?: string;
  imageUri?: string;
  audio?: AudioAffordance;
};

/** Result of typed-answer checking, already computed by the feature (domain). */
export type CheckedAnswer = {
  correct: boolean;
  expected: string;
  /** All accepted alternatives for a blank/answer, in user-defined order. */
  acceptedAnswers?: readonly string[];
  /** Index of the alternative that should appear first on the back. */
  expectedIndex?: number;
};

/**
 * Answer behavior per card type — discriminated by `kind`.
 * `kind` (not `cardType`) is the source of truth for the state machine.
 */
export type ReviewAnswerBehavior =
  /** Vocabulary (§8): mental answer → "Flip card" only. */
  | { kind: 'reveal' }
  /**
   * Listening (§10): listen to audio and respond by typing (compared against back transcription)
   * OR by recording your own speech (no automatic comparison — replay only on the back).
   */
  | {
      kind: 'listening';
      promptLabel?: string;
      checkAnswer: (typed: string) => CheckedAnswer;
      isRecording: boolean;
      recordedUri: string | null;
      onStartRecording: () => void;
      onStopRecording: () => void;
      onPlayRecording: () => void;
    }
  /**
   * Cloze (§9): ONE OR MORE blanks, each with OPTIONAL typing compared against that blank's
   * accepted answers. Each blank brings its own label and check (resolved by the feature);
   * the UI only cycles through already-resolved alternatives.
   */
  | {
      kind: 'cloze';
      blanks: Array<{
        label: string;
        acceptedAnswers: readonly string[];
        checkAnswer: (typed: string) => CheckedAnswer;
      }>;
      composeBackText?: (answersByBlank: readonly string[]) => string;
    }
  /** Typing (§11): type + "Verify"; final rating is manual. */
  | {
      kind: 'typing';
      promptLabel?: string;
      checkAnswer: (typed: string) => CheckedAnswer;
    }
  /**
   * Pronunciation (§12): front shows text and records voice; model audio stays on the back
   * (`back.audio`), replayed alongside the user's recording. NO automatic comparison.
   */
  | {
      kind: 'recording';
      isRecording: boolean;
      recordedUri: string | null;
      onStartRecording: () => void;
      onStopRecording: () => void;
      onPlayRecording: () => void;
    };

export type FlashcardViewModel = {
  cardType: CardType;
  front: CardFaceViewModel;
  back: CardFaceViewModel;
  answer: ReviewAnswerBehavior;
};

export type FlashcardReviewPresentation = 'modal' | 'container';

export type FlashcardReviewProps = {
  /** Controls whether the card is visible/rendered. */
  visible: boolean;
  /** `modal` keeps the floating preview; `container` embeds the card in the current screen. */
  presentation?: FlashcardReviewPresentation;
  /**
   * Identity of the displayed card. When it changes (session advance), resets flip/answer
   * state and triggers the enter animation. Optional: "Test" mode does not need it.
   */
  cardKey?: number;
  card: FlashcardViewModel;
  strings: StringCatalog['review'];
  ttsPlaybackSpeed: TtsPlaybackSpeed;
  ttsSpeedLabels: Record<TtsPlaybackSpeed, string>;
  onTtsPlaybackSpeedChange: (speed: TtsPlaybackSpeed) => void;
  /**
   * Fired when one of the 4 ratings is chosen. The component is agnostic:
   * in "Test" (creation) it only closes; in real review it schedules + records stats.
   */
  onRate: (rating: ReviewRating) => void;
  /** Close the preview/modal (close button / Android back). */
  onClose?: () => void;
  /** Notifies that the card was flipped (telemetry/back audio). */
  onFlip?: () => void;
  /** Forces instant swap (no animation). Default reads system AccessibilityInfo. */
  reduceMotion?: boolean;
};
