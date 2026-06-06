import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { FlashcardViewModel } from '@/components/review';
import type { ReviewRating } from '@/constants/reviewRatings';
import { MEDIA_SIDES } from '@/domain/entities/Media';
import { useAudioRecording } from '@/features/cards/hooks/useAudioRecording';
import { useCardTts } from '@/features/cards/hooks/useCardTts';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';

import { buildReviewViewModelFromCard } from '../services/buildReviewViewModelFromCard';
import {
  currentCard as selectCurrentCard,
  currentProgress,
  initialReviewSessionState,
  reviewSessionReducer,
} from '../services/reviewSessionReducer';
import type { SessionStats } from '../services/reviewSessionStats';
import { useDueReviewCards } from './useDueReviewCards';
import { useSubmitReview } from './useSubmitReview';

const MAX_REVIEW_RECORDING_MS = 30_000;

export type ReviewSession = {
  viewModel: FlashcardViewModel | null;
  isLoading: boolean;
  /** Carregou e não havia cards vencidos. */
  isEmpty: boolean;
  /** A fila esvaziou após ter cards (sessão concluída). */
  isFinished: boolean;
  progress: { current: number; total: number };
  stats: SessionStats;
  handleRate: (rating: ReviewRating) => void;
  handleFlip: () => void;
};

/**
 * Orquestra a sessão de revisão (§35): carrega vencidos, mantém a fila (estado local), monta o
 * view-model atual reusando `FlashcardReview`, e em cada avaliação agenda via SM-2 + grava o
 * log (mutation) e avança. "Errei" repete o card na mesma sessão (reducer).
 */
export function useReviewSession(): ReviewSession {
  const due = useDueReviewCards();
  const submitReviewMutation = useSubmitReview();
  const tts = useCardTts();
  const strings = useStrings();

  const [state, dispatch] = useReducer(reviewSessionReducer, initialReviewSessionState);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const cardStartedAtRef = useRef<number>(0);

  const audio = useAudioRecording({
    maxDurationMs: MAX_REVIEW_RECORDING_MS,
    onError: () => undefined,
    onComplete: ({ uri }) => setRecordedUri(uri),
  });

  // Inicializa a fila uma única vez, com o snapshot de vencidos.
  useEffect(() => {
    if (!state.initialized && !due.isLoading && due.data) {
      cardStartedAtRef.current = Date.now();
      dispatch({ type: 'INIT', cards: due.data, now: Date.now() });
    }
  }, [state.initialized, due.isLoading, due.data]);

  const currentCard = selectCurrentCard(state);

  const viewModel = useMemo<FlashcardViewModel | null>(() => {
    if (!currentCard) {
      return null;
    }

    return buildReviewViewModelFromCard({
      card: currentCard,
      reviewStrings: strings.review,
      onPlayAudio: audio.playAudio,
      onSpeakTts: (text, language) => {
        void tts.speak(text, language);
      },
      currentlyPlayingUri: null,
      recording: {
        isRecording: audio.isRecording,
        recordedUri,
        onStartRecording: () => void audio.startRecording(MEDIA_SIDES.FRONT),
        onStopRecording: () => void audio.stopRecording(),
        onPlayRecording: () => {
          if (recordedUri) {
            audio.playAudio(recordedUri);
          }
        },
      },
    });
  }, [currentCard, audio, tts, recordedUri, strings.review]);

  const handleRate = useCallback(
    (rating: ReviewRating) => {
      if (!currentCard) {
        return;
      }

      const timeSpentMs = Math.max(0, Date.now() - cardStartedAtRef.current);
      // Offline-first: persistência local; falhas não travam a sessão (apenas não reagendam).
      submitReviewMutation.mutate({ reviewItem: currentCard.reviewItem, rating, timeSpentMs });

      if (audio.isRecording) {
        void audio.stopRecording();
      }
      setRecordedUri(null);
      cardStartedAtRef.current = Date.now();
      dispatch({ type: 'RATE', rating, now: Date.now() });
    },
    [currentCard, submitReviewMutation, audio],
  );

  const handleFlip = useCallback(() => undefined, []);

  return {
    viewModel,
    isLoading: due.isLoading || !state.initialized,
    isEmpty: state.initialized && state.total === 0,
    isFinished: state.initialized && state.total > 0 && state.finished,
    progress: currentProgress(state),
    stats: state.stats,
    handleRate,
    handleFlip,
  };
}
