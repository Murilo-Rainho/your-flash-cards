import { useCallback, useMemo, useState } from 'react';

import type { FlashcardViewModel } from '@/components/review';
import type { CardType } from '@/constants/cardTypes';
import { MEDIA_SIDES, type MediaSide } from '@/domain/entities/Media';
import type { StringCatalog } from '@/strings/types';

import { buildReviewViewModel } from '../services/buildReviewViewModel';
import type { CreateCardMediaInput } from '../services/createCard';
import { useAudioRecording } from './useAudioRecording';

const MAX_TEST_RECORDING_MS = 30_000;

type ClozeParts = { before: string; gap: string; after: string };

type UseCardTestReviewParams = {
  type: CardType;
  frontText: string;
  backText: string;
  cloze: { front: ClozeParts; back: ClozeParts };
  frontMedia: CreateCardMediaInput[];
  backMedia: CreateCardMediaInput[];
  reviewStrings: StringCatalog['review'];
  onPlayAudio: (uri: string) => void;
  onSpeakTts: (side: MediaSide) => void;
};

export type CardTestReview = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Avaliação no modo teste: apenas fecha (não persiste nada, não afeta estatísticas). */
  handleRate: () => void;
  viewModel: FlashcardViewModel | null;
};

/**
 * Pré-visualização ("Testar") do card em criação usando o `FlashcardReview`.
 *
 * Monta o view-model a partir do estado do formulário e mantém uma sessão de gravação
 * SEPARADA e descartável (pronúncia) — a gravação de teste nunca entra na mídia do card.
 * `handleRate` apenas fecha: nada é agendado/persistido (§ não interfere nos acertos reais).
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
    onError: () => undefined, // preview não deve exibir erros de gravação
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
