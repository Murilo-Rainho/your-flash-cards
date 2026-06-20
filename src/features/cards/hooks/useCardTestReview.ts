import { useCallback, useMemo, useState } from 'react';

import type { FlashcardViewModel } from '@/components/review';
import type { CardType } from '@/constants/cardTypes';
import type { TtsPlaybackSpeed } from '@/constants/tts';
import type { ClozeContent } from '@/domain/cloze/clozeContent';
import { MEDIA_SIDES, type MediaSide } from '@/domain/entities/Media';
import type { StringCatalog } from '@/strings/types';

import { buildReviewViewModel } from '../services/buildReviewViewModel';
import type { CreateCardMediaInput } from '../services/createCard';
import { useAudioRecording } from './useAudioRecording';

const MAX_TEST_RECORDING_MS = 30_000;

type UseCardTestReviewParams = {
  type: CardType;
  frontText: string;
  backText: string;
  cloze: ClozeContent;
  frontMedia: CreateCardMediaInput[];
  backMedia: CreateCardMediaInput[];
  reviewStrings: StringCatalog['review'];
  onPlayAudio: (uri: string) => void;
  onSpeakTts: (side: MediaSide, speed: TtsPlaybackSpeed) => void;
};

export type CardTestReview = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Test-mode rating: only closes (persists nothing, does not affect stats). */
  handleRate: () => void;
  viewModel: FlashcardViewModel | null;
};

/**
 * Preview ("Test") of the card being created using `FlashcardReview`.
 *
 * Builds the view-model from form state and keeps a SEPARATE, disposable recording session
 * (pronunciation) — test recording never enters card media.
 * `handleRate` only closes: nothing is scheduled/persisted (§ does not affect real stats).
 */
export function useCardTestReview(params: UseCardTestReviewParams): CardTestReview {
  const {
    type,
    frontText,
    backText,
    cloze,
    frontMedia,
    backMedia,
    reviewStrings,
    onPlayAudio,
    onSpeakTts,
  } = params;

  const [isOpen, setIsOpen] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const { isRecording, startRecording, stopRecording } = useAudioRecording({
    maxDurationMs: MAX_TEST_RECORDING_MS,
    onError: () => undefined, // preview must not show recording errors
    onComplete: ({ uri }) => setRecordedUri(uri),
  });

  const close = useCallback(() => {
    setIsOpen(false);
    if (isRecording) {
      void stopRecording();
    }
    setRecordedUri(null);
  }, [isRecording, stopRecording]);

  const open = useCallback(() => setIsOpen(true), []);
  const handleRate = useCallback(() => close(), [close]);

  const viewModel = useMemo<FlashcardViewModel | null>(() => {
    if (!isOpen) {
      return null;
    }

    return buildReviewViewModel({
      type,
      frontText,
      backText,
      cloze,
      frontMedia,
      backMedia,
      reviewStrings,
      onPlayAudio,
      onSpeakTts,
      recording: {
        isRecording,
        recordedUri,
        onStartRecording: () => void startRecording(MEDIA_SIDES.FRONT),
        onStopRecording: () => void stopRecording(),
        onPlayRecording: () => {
          if (recordedUri) {
            onPlayAudio(recordedUri);
          }
        },
      },
    });
  }, [
    isOpen,
    type,
    frontText,
    backText,
    cloze,
    frontMedia,
    backMedia,
    reviewStrings,
    onPlayAudio,
    onSpeakTts,
    isRecording,
    recordedUri,
    startRecording,
    stopRecording,
  ]);

  return { isOpen, open, close, handleRate, viewModel };
}
