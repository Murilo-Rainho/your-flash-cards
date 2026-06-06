import type { CardType } from '@/constants/cardTypes';
import type { ReviewRating } from '@/constants/reviewRatings';
import type { StringCatalog } from '@/strings/types';

/**
 * Contrato de view-model do componente de revisão (`FlashcardReview`).
 *
 * IMPORTANTE: este arquivo é UI burra (camada `components/`). Ele NÃO importa `domain/`,
 * `infrastructure/` nem `features/`. Toda regra (comparação de resposta, reprodução de
 * áudio/TTS, gravação) é resolvida na camada `features/` e injetada aqui como callback.
 */

/** Afordância de áudio genérica (arquivo local ou TTS). O componente só dispara `onPlay`. */
export type AudioAffordance = {
  label: string;
  onPlay: () => void;
  isPlaying?: boolean;
  accessibilityLabel?: string;
};

/** Um lado do card (frente ou verso). Tudo opcional → pode ser só texto, só imagem ou só áudio. */
export type CardFaceViewModel = {
  text?: string;
  imageUri?: string;
  audio?: AudioAffordance;
};

/** Resultado de checagem de resposta digitada, JÁ computado pela feature (domínio). */
export type CheckedAnswer = {
  correct: boolean;
  expected: string;
};

/**
 * Comportamento de resposta por tipo de card — discriminado por `kind`.
 * O `kind` (não o `cardType`) é a fonte de verdade da máquina de estado.
 */
export type ReviewAnswerBehavior =
  /** Vocabulário (§8): resposta mental → apenas "Virar card". */
  | { kind: 'reveal' }
  /**
   * Escuta (§10): ouve o áudio e responde digitando (comparado com a transcrição do verso)
   * OU gravando a própria fala (sem comparação automática — só re-escuta no verso).
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
  /** Cloze (§9): digitação OPCIONAL comparada com a lacuna do verso. */
  | {
      kind: 'cloze';
      promptLabel?: string;
      checkAnswer: (typed: string) => CheckedAnswer;
    }
  /** Escrita (§11): digitação + "Verificar"; permite override manual no verso. */
  | {
      kind: 'typing';
      promptLabel?: string;
      checkAnswer: (typed: string) => CheckedAnswer;
    }
  /**
   * Pronúncia (§12): a frente mostra o texto e grava a voz; o áudio modelo fica no verso
   * (`back.audio`), reouvido junto da própria gravação. SEM comparação automática.
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

export type FlashcardReviewProps = {
  /** Controla o Modal de overlay. */
  visible: boolean;
  card: FlashcardViewModel;
  strings: StringCatalog['review'];
  /**
   * Disparado ao escolher uma das 4 avaliações. O componente é agnóstico:
   * em "Testar" (criação) apenas fecha; na revisão real agenda + grava estatística.
   */
  onRate: (rating: ReviewRating) => void;
  /** Fechar o overlay (botão fechar / back do Android). */
  onClose?: () => void;
  /** Notifica que o card foi virado (telemetria/áudio do verso). */
  onFlip?: () => void;
  /** Força swap instantâneo (sem animação). Default lê o AccessibilityInfo do sistema. */
  reduceMotion?: boolean;
};
