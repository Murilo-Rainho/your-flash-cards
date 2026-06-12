import type { AudioAffordance } from '@/components/review';
import { CARD_TYPES } from '@/constants/cardTypes';
import { TTS_PLAYBACK_SPEEDS, type TtsPlaybackSpeed } from '@/constants/tts';
import { VARIANT_TYPES } from '@/domain/entities/CardVariant';
import { MEDIA_SIDES, MEDIA_TYPES, type Media } from '@/domain/entities/Media';
import type { DueReviewCard } from '@/domain/repositories/ReviewRepository';
import { enUS } from '@/strings/locales/en-US';

import {
  buildReviewViewModelFromCard,
  type BuildReviewViewModelFromCardSource,
} from './buildReviewViewModelFromCard';

function makeMedia(overrides: Partial<Media>): Media {
  return {
    id: 'media-1',
    cardId: 'card-1',
    side: MEDIA_SIDES.FRONT,
    type: MEDIA_TYPES.AUDIO,
    uri: 'file://a.m4a',
    mimeType: 'audio/m4a',
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  };
}

function makeCard(overrides: Partial<DueReviewCard> = {}): DueReviewCard {
  return {
    reviewItem: {
      id: 'review-item-1',
      cardVariantId: 'variant-1',
      schedulerType: 'sm2',
      schedulerVersion: 'v1',
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      nextReviewAt: '2026-06-01T10:00:00.000Z',
      lapses: 0,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    },
    cardId: 'card-1',
    cardType: CARD_TYPES.VOCABULARY,
    front: '',
    back: '',
    variantType: VARIANT_TYPES.ORIGINAL,
    media: [],
    ...overrides,
  };
}

function createSource(card: DueReviewCard) {
  const played: string[] = [];
  const spoken: Array<{ text: string; language: string; speed: TtsPlaybackSpeed }> = [];
  const recordingCalls = { start: 0, stop: 0, play: 0 };

  const source: BuildReviewViewModelFromCardSource = {
    card,
    reviewStrings: enUS.review,
    onPlayAudio: (uri) => played.push(uri),
    onSpeakTts: (text, language, speed) => spoken.push({ text, language, speed }),
    currentlyPlayingUri: null,
    recording: {
      isRecording: false,
      recordedUri: null,
      onStartRecording: () => recordingCalls.start++,
      onStopRecording: () => recordingCalls.stop++,
      onPlayRecording: () => recordingCalls.play++,
    },
  };

  return { source, played, spoken, recordingCalls };
}

function playAudio(audio: AudioAffordance | undefined): void {
  if (audio?.type !== 'audio') {
    throw new Error('esperado audio');
  }

  audio.onPlay();
}

function playTts(
  audio: AudioAffordance | undefined,
  speed: TtsPlaybackSpeed = TTS_PLAYBACK_SPEEDS.SLOW,
): void {
  if (audio?.type !== 'tts') {
    throw new Error('esperado tts');
  }

  audio.onPlay(speed);
}

describe('buildReviewViewModelFromCard', () => {
  it('vocabulário: texto/imagem/áudio na frente, texto no verso, reveal', () => {
    const card = makeCard({
      cardType: CARD_TYPES.VOCABULARY,
      front: 'apple',
      back: 'maçã',
      media: [
        makeMedia({
          id: 'm-img',
          type: MEDIA_TYPES.IMAGE,
          uri: 'file://img.png',
          mimeType: 'image/png',
        }),
        makeMedia({ id: 'm-aud', type: MEDIA_TYPES.AUDIO, uri: 'file://a.m4a' }),
      ],
    });
    const { source, played } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.text).toBe('apple');
    expect(vm.front.imageUri).toBe('file://img.png');
    expect(vm.back.text).toBe('maçã');
    expect(vm.answer.kind).toBe('reveal');

    playAudio(vm.front.audio);
    expect(played).toEqual(['file://a.m4a']);
  });

  it('vocabulário com mídia TTS: fala o texto da frente no idioma do uri', () => {
    const card = makeCard({
      cardType: CARD_TYPES.VOCABULARY,
      front: 'apple',
      back: 'maçã',
      media: [
        makeMedia({
          id: 'm-tts',
          type: MEDIA_TYPES.TTS,
          uri: 'tts://local/en-US/front',
          mimeType: 'application/x-tts',
        }),
      ],
    });
    const { source, spoken } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);
    playTts(vm.front.audio);

    expect(spoken).toEqual([{ text: 'apple', language: 'en-US', speed: TTS_PLAYBACK_SPEEDS.SLOW }]);
  });

  it('marca isPlaying quando a uri tocando casa com a do áudio', () => {
    const card = makeCard({
      cardType: CARD_TYPES.VOCABULARY,
      front: 'apple',
      media: [makeMedia({ type: MEDIA_TYPES.AUDIO, uri: 'file://a.m4a' })],
    });
    const { source } = createSource(card);
    source.currentlyPlayingUri = 'file://a.m4a';

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.audio?.isPlaying).toBe(true);
  });

  it('cloze legado: deriva 1 lacuna/1 resposta de front/back (sem cloze_data)', () => {
    const card = makeCard({
      cardType: CARD_TYPES.CLOZE,
      front: "I'm {tired} now",
      back: "I'm tired now",
    });
    const { source } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.text).toBe("I'm {tired} now");
    expect(vm.back.text).toBe("I'm tired now");
    if (vm.answer.kind !== 'cloze') {
      throw new Error('esperado cloze');
    }
    expect(vm.answer.blanks).toHaveLength(1);
    expect(vm.answer.blanks[0].label).toBe(enUS.review.answer.clozePrompt);
    expect(vm.answer.blanks[0].acceptedAnswers).toEqual(['tired']);
    expect(vm.answer.blanks[0].checkAnswer('TIRED')).toEqual({
      correct: true,
      expected: 'tired',
      acceptedAnswers: ['tired'],
      expectedIndex: 0,
    });
    expect(vm.answer.blanks[0].checkAnswer('happy')).toEqual({
      correct: false,
      expected: 'tired',
      acceptedAnswers: ['tired'],
      expectedIndex: 0,
    });
  });

  it('cloze estruturado: múltiplas lacunas e múltiplas respostas aceitas', () => {
    const card = makeCard({
      cardType: CARD_TYPES.CLOZE,
      front: 'It was raining. {Mesmo assim}, we went hiking.',
      back: 'It was raining. Still, we went hiking.',
      cloze: {
        segments: [
          { kind: 'text', text: 'It was raining. ' },
          { kind: 'blank', hint: 'Mesmo assim', answers: ['Still', 'Even so', 'Nevertheless'] },
          { kind: 'text', text: ', we went hiking.' },
        ],
      },
    });
    const { source } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.text).toBe('It was raining. {Mesmo assim}, we went hiking.');
    if (vm.answer.kind !== 'cloze') {
      throw new Error('esperado cloze');
    }
    expect(vm.answer.blanks).toHaveLength(1);
    expect(vm.answer.blanks[0].checkAnswer('even so')).toEqual({
      correct: true,
      expected: 'Even so',
      acceptedAnswers: ['Still', 'Even so', 'Nevertheless'],
      expectedIndex: 1,
    });
    expect(vm.answer.blanks[0].checkAnswer('Nevertheless')).toEqual({
      correct: true,
      expected: 'Nevertheless',
      acceptedAnswers: ['Still', 'Even so', 'Nevertheless'],
      expectedIndex: 2,
    });
    expect(vm.answer.blanks[0].checkAnswer('however')).toEqual({
      correct: false,
      expected: 'Still',
      acceptedAnswers: ['Still', 'Even so', 'Nevertheless'],
      expectedIndex: 0,
    });
    expect(vm.answer.composeBackText?.(['Even so'])).toBe(
      'It was raining. Even so, we went hiking.',
    );
  });

  it('escrita (typing): frente é mídia, verso é a resposta comparada por normalização', () => {
    const card = makeCard({
      cardType: CARD_TYPES.TYPING,
      front: 'Estou cansado',
      back: "I'm tired now.",
      media: [makeMedia({ type: MEDIA_TYPES.AUDIO, uri: 'file://a.m4a' })],
    });
    const { source, played } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.text).toBeUndefined();
    playAudio(vm.front.audio);
    expect(played).toEqual(['file://a.m4a']);
    expect(vm.back.text).toBe("I'm tired now.");
    if (vm.answer.kind !== 'typing') {
      throw new Error('esperado typing');
    }
    expect(vm.answer.checkAnswer("i'm tired now").correct).toBe(true);
    expect(vm.answer.checkAnswer('errado').correct).toBe(false);
  });

  it('escuta (listening): áudio na frente reouvido no verso + transcrição + comparação', () => {
    const card = makeCard({
      cardType: CARD_TYPES.LISTENING,
      front: '',
      back: "I'm tired now.",
      media: [makeMedia({ type: MEDIA_TYPES.AUDIO, uri: 'file://a.m4a' })],
    });
    const { source, played } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.back.text).toBe("I'm tired now.");
    playAudio(vm.front.audio);
    playAudio(vm.back.audio);
    expect(played).toEqual(['file://a.m4a', 'file://a.m4a']);
    if (vm.answer.kind !== 'listening') {
      throw new Error('esperado listening');
    }
    expect(vm.answer.checkAnswer('IM tired now').correct).toBe(true);
  });

  it('escuta com TTS na frente fala a transcrição (verso)', () => {
    const card = makeCard({
      cardType: CARD_TYPES.LISTENING,
      front: "I'm tired now.",
      back: "I'm tired now.",
      media: [
        makeMedia({
          type: MEDIA_TYPES.TTS,
          uri: 'tts://local/en-US/front',
          mimeType: 'application/x-tts',
        }),
      ],
    });
    const { source, spoken } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);
    playTts(vm.front.audio);

    expect(spoken).toEqual([
      { text: "I'm tired now.", language: 'en-US', speed: TTS_PLAYBACK_SPEEDS.SLOW },
    ]);
  });

  it('pronúncia: texto na frente, áudio modelo no verso, kind recording', () => {
    const card = makeCard({
      cardType: CARD_TYPES.PRONUNCIATION,
      front: 'water',
      back: '',
      media: [makeMedia({ side: MEDIA_SIDES.BACK, type: MEDIA_TYPES.AUDIO, uri: 'file://b.m4a' })],
    });
    const { source, played, recordingCalls } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.text).toBe('water');
    expect(vm.front.audio).toBeUndefined();
    if (vm.answer.kind !== 'recording') {
      throw new Error('esperado recording');
    }
    playAudio(vm.back.audio);
    expect(played).toEqual(['file://b.m4a']);
    vm.answer.onStopRecording();
    expect(recordingCalls.stop).toBe(1);
  });

  it('pronúncia com TTS no verso fala o texto da frente', () => {
    const card = makeCard({
      cardType: CARD_TYPES.PRONUNCIATION,
      front: 'water',
      back: 'water',
      media: [
        makeMedia({
          side: MEDIA_SIDES.BACK,
          type: MEDIA_TYPES.TTS,
          uri: 'tts://local/en-US/back',
          mimeType: 'application/x-tts',
        }),
      ],
    });
    const { source, spoken } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);
    playTts(vm.back.audio);

    expect(spoken).toEqual([{ text: 'water', language: 'en-US', speed: TTS_PLAYBACK_SPEEDS.SLOW }]);
  });

  it('reverso: vira vocabulário/reveal com os lados trocados', () => {
    const card = makeCard({
      cardType: CARD_TYPES.VOCABULARY,
      front: 'apple',
      back: 'maçã',
      variantType: VARIANT_TYPES.REVERSE,
      media: [makeMedia({ type: MEDIA_TYPES.AUDIO, uri: 'file://a.m4a' })],
    });
    const { source, played } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.text).toBe('maçã');
    expect(vm.back.text).toBe('apple');
    expect(vm.answer.kind).toBe('reveal');
    // A mídia (que era da frente original) aparece no verso do reverso.
    playAudio(vm.back.audio);
    expect(played).toEqual(['file://a.m4a']);
  });

  it('best-effort: campos vazios viram undefined sem lançar', () => {
    const card = makeCard({ cardType: CARD_TYPES.VOCABULARY, front: '', back: '' });
    const { source } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.text).toBeUndefined();
    expect(vm.back.text).toBeUndefined();
    expect(vm.front.audio).toBeUndefined();
  });
});
