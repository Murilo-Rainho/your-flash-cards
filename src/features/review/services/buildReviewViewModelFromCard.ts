import type {
  CardFaceViewModel,
  FlashcardViewModel,
  ReviewAnswerBehavior,
} from '@/components/review';
import { CARD_TYPES } from '@/constants/cardTypes';
import type { TtsPlaybackSpeed } from '@/constants/tts';
import { normalizeStudyAnswer } from '@/domain/cloze/cloze';
import {
  checkClozeBlank,
  composeClozeFront,
  getClozeBlanks,
  resolveClozeContent,
} from '@/domain/cloze/clozeContent';
import { VARIANT_TYPES } from '@/domain/entities/CardVariant';
import { MEDIA_SIDES, MEDIA_TYPES, type Media, type MediaSide } from '@/domain/entities/Media';
import type { DueReviewCard } from '@/domain/repositories/ReviewRepository';
import type { StringCatalog } from '@/strings/types';

/** Estado/handlers da gravação da sessão (pronúncia/escuta), injetados pela feature. */
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

/** Extrai o idioma de uma mídia TTS persistida (`tts://local/{lang}/{side}`). */
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

/** Rótulo do campo de cada lacuna: 1 lacuna mantém o prompt atual; N usam "Lacuna i". */
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
 * Monta a afordância de áudio de um lado: prioriza arquivo (áudio/gravação) e, na ausência,
 * usa a mídia TTS persistida — falando `ttsText` (o texto que faz sentido para aquele tipo,
 * decidido pelo chamador, igual ao builder de formulário) no idioma codificado no uri.
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
 * Constrói o `FlashcardViewModel` (agnóstico de domínio) a partir de um card PERSISTIDO
 * (`DueReviewCard`). É o análogo de `buildReviewViewModel` (que parte do formulário): produz o
 * MESMO view-model consumido pelo `FlashcardReview`, reaproveitando os helpers de cloze.
 *
 * Reverso: tratado SEMPRE como vocabulário/reveal com os lados trocados. Cloze/escrita/escuta/
 * pronúncia invertidos não têm checagem confiável offline, então a V1 evita lógica frágil aqui.
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
    // Funciona para o novo formato (card.cloze) e para cards legados (bridge front/back).
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
          checkAnswer: (typed: string) => ({
            correct: checkClozeBlank(blank.answers, typed),
            expected: blank.answers[0] ?? '',
          }),
        })),
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
    // O áudio da frente fala a frase (transcrição do verso); reouvido no verso ao lado dela.
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
    // O verso é o áudio modelo da pronúncia do texto da frente (por isso o TTS fala card.front).
    const modelAudio = buildAudioFace(MEDIA_SIDES.BACK, media, card.front, source);
    return {
      cardType: card.cardType,
      front: { text: toUndefined(card.front) },
      back: { audio: modelAudio },
      answer: { kind: 'recording', ...buildRecordingBehavior(source) },
    };
  }

  // VOCABULARY (padrão): texto/imagem/áudio na frente, texto no verso, resposta "reveal".
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
