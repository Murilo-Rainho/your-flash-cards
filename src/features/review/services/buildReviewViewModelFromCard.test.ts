import { describe, expect, it } from '@jest/globals';

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
    throw new Error('expected audio');
  }

  audio.onPlay();
}

function playTts(
  audio: AudioAffordance | undefined,
  speed: TtsPlaybackSpeed = TTS_PLAYBACK_SPEEDS.SLOW,
): void {
  if (audio?.type !== 'tts') {
    throw new Error('expected tts');
  }

  audio.onPlay(speed);
}

describe('buildReviewViewModelFromCard', () => {
  it('vocabulary: text/image/audio on front, text on back, reveal', () => {
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

  it('vocabulary with TTS media: speaks front text in uri language', () => {
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

  it('sets isPlaying when playing uri matches audio uri', () => {
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

  it('legacy cloze: derives 1 blank/1 answer from front/back (no cloze_data)', () => {
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
      throw new Error('expected cloze');
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

  it('structured cloze: multiple blanks and multiple accepted answers', () => {
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
      throw new Error('expected cloze');
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

  it('typing: front is media, back is answer compared by normalization', () => {
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
      throw new Error('expected typing');
    }
    expect(vm.answer.checkAnswer("i'm tired now").correct).toBe(true);
    expect(vm.answer.checkAnswer('errado').correct).toBe(false);
  });

  it('listening: front audio replayed on back + transcription + comparison', () => {
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
      throw new Error('expected listening');
    }
    expect(vm.answer.checkAnswer('IM tired now').correct).toBe(true);
  });

  it('listening with front TTS speaks the transcription (back)', () => {
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

  it('pronunciation: text on front, model audio on back, kind recording', () => {
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
      throw new Error('expected recording');
    }
    playAudio(vm.back.audio);
    expect(played).toEqual(['file://b.m4a']);
    vm.answer.onStopRecording();
    expect(recordingCalls.stop).toBe(1);
  });

  it('pronunciation with back TTS speaks front text', () => {
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

  it('reverse: becomes vocabulary/reveal with swapped sides', () => {
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
    // Media (from the original front) appears on the reverse variant back.
    playAudio(vm.back.audio);
    expect(played).toEqual(['file://a.m4a']);
  });

  it('best-effort: empty fields become undefined without throwing', () => {
    const card = makeCard({ cardType: CARD_TYPES.VOCABULARY, front: '', back: '' });
    const { source } = createSource(card);

    const vm = buildReviewViewModelFromCard(source);

    expect(vm.front.text).toBeUndefined();
    expect(vm.back.text).toBeUndefined();
    expect(vm.front.audio).toBeUndefined();
  });
});
