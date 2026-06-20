import { describe, expect, it } from '@jest/globals';

import type { AudioAffordance } from '@/components/review';
import { CARD_TYPES } from '@/constants/cardTypes';
import { TTS_PLAYBACK_SPEEDS, type TtsPlaybackSpeed } from '@/constants/tts';
import { buildClozeContent } from '@/domain/cloze/clozeContent';
import { enUS } from '@/strings/locales/en-US';

import {
  buildReviewViewModel,
  type ReviewSource,
} from '@/features/cards/services/buildReviewViewModel';
import type { CreateCardMediaInput } from '@/features/cards/services/createCard';

const emptyCloze = buildClozeContent('', []);

function createSource(
  overrides: Partial<Omit<ReviewSource, 'recording'>> = {},
  recordingState: { isRecording?: boolean; recordedUri?: string | null } = {},
) {
  const played: string[] = [];
  const spoken: Array<{ side: string; speed: TtsPlaybackSpeed }> = [];
  const recordingCalls = { start: 0, stop: 0, play: 0 };

  const source: ReviewSource = {
    type: CARD_TYPES.VOCABULARY,
    frontText: '',
    backText: '',
    cloze: emptyCloze,
    frontMedia: [],
    backMedia: [],
    reviewStrings: enUS.review,
    onPlayAudio: (uri) => played.push(uri),
    onSpeakTts: (side, speed) => spoken.push({ side, speed }),
    ...overrides,
    recording: {
      isRecording: recordingState.isRecording ?? false,
      recordedUri: recordingState.recordedUri ?? null,
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

const imageFront: CreateCardMediaInput = {
  side: 'front',
  type: 'image',
  uri: 'file://img.png',
  mimeType: 'image/png',
};
const audioFront: CreateCardMediaInput = {
  side: 'front',
  type: 'audio',
  uri: 'file://a.m4a',
  mimeType: 'audio/m4a',
};
const audioBack: CreateCardMediaInput = {
  side: 'back',
  type: 'audio',
  uri: 'file://b.m4a',
  mimeType: 'audio/m4a',
};

describe('buildReviewViewModel', () => {
  it('vocabulary: text/image/audio on front, text on back, "reveal" answer', () => {
    const { source, played } = createSource({
      type: CARD_TYPES.VOCABULARY,
      frontText: 'apple',
      backText: 'maçã',
      frontMedia: [imageFront, audioFront],
    });

    const vm = buildReviewViewModel(source);

    expect(vm.front.text).toBe('apple');
    expect(vm.front.imageUri).toBe('file://img.png');
    expect(vm.back.text).toBe('maçã');
    expect(vm.answer.kind).toBe('reveal');

    playAudio(vm.front.audio);
    expect(played).toEqual(['file://a.m4a']);
  });

  it('cloze: front shows hint in braces, full back and normalization check', () => {
    const { source } = createSource({
      type: CARD_TYPES.CLOZE,
      cloze: buildClozeContent("I'm {cansado} now", [['tired']]),
    });

    const vm = buildReviewViewModel(source);

    expect(vm.front.text).toBe("I'm {cansado} now");
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

  it('cloze: multiple blanks, each with its own check and accepted answers', () => {
    const { source } = createSource({
      type: CARD_TYPES.CLOZE,
      cloze: buildClozeContent('I would like {ambos} water {e} juice.', [
        ['both', 'the two'],
        ['and'],
      ]),
    });

    const vm = buildReviewViewModel(source);

    expect(vm.front.text).toBe('I would like {ambos} water {e} juice.');
    expect(vm.back.text).toBe('I would like both water and juice.');
    if (vm.answer.kind !== 'cloze') {
      throw new Error('expected cloze');
    }
    expect(vm.answer.blanks).toHaveLength(2);
    expect(vm.answer.blanks[0].label).toBe(`${enUS.review.answer.clozeBlankLabel} 1`);
    expect(vm.answer.blanks[0].acceptedAnswers).toEqual(['both', 'the two']);
    expect(vm.answer.blanks[0].checkAnswer('the two')).toEqual({
      correct: true,
      expected: 'the two',
      acceptedAnswers: ['both', 'the two'],
      expectedIndex: 1,
    });
    expect(vm.answer.blanks[1].checkAnswer('and')).toEqual({
      correct: true,
      expected: 'and',
      acceptedAnswers: ['and'],
      expectedIndex: 0,
    });
    expect(vm.answer.blanks[1].checkAnswer('or')).toEqual({
      correct: false,
      expected: 'and',
      acceptedAnswers: ['and'],
      expectedIndex: 0,
    });
    expect(vm.answer.composeBackText?.(['the two', 'and'])).toBe(
      'I would like the two water and juice.',
    );
  });

  it('incomplete cloze: does not break (best-effort)', () => {
    const { source } = createSource({ type: CARD_TYPES.CLOZE, cloze: emptyCloze });

    const vm = buildReviewViewModel(source);

    expect(vm.front.text).toBeUndefined();
    expect(vm.back.text).toBeUndefined();
    if (vm.answer.kind !== 'cloze') {
      throw new Error('expected cloze');
    }
    expect(vm.answer.blanks).toEqual([]);
  });

  it('typing: front shows media (no text) and compares answer with back', () => {
    const { source, played } = createSource({
      type: CARD_TYPES.TYPING,
      frontText: '',
      backText: "I'm tired now.",
      frontMedia: [audioFront],
    });

    const vm = buildReviewViewModel(source);

    // Front never shows text: it is the prompt audio/image.
    expect(vm.front.text).toBeUndefined();
    playAudio(vm.front.audio);
    expect(played).toEqual(['file://a.m4a']);

    expect(vm.back.text).toBe("I'm tired now.");
    expect(vm.answer.kind).toBe('typing');

    if (vm.answer.kind !== 'typing') {
      throw new Error('expected typing');
    }
    expect(vm.answer.checkAnswer("i'm tired now").correct).toBe(true);
    expect(vm.answer.checkAnswer('errado').correct).toBe(false);
  });

  it('typing with image on front and TTS fallback from source text', () => {
    const { source, spoken } = createSource({
      type: CARD_TYPES.TYPING,
      frontText: 'Estou cansado agora.',
      backText: "I'm tired now.",
      frontMedia: [imageFront],
    });

    const vm = buildReviewViewModel(source);

    expect(vm.front.imageUri).toBe('file://img.png');
    // No audio file: source text becomes live TTS on the front.
    playTts(vm.front.audio);
    expect(spoken).toEqual([{ side: 'front', speed: TTS_PLAYBACK_SPEEDS.SLOW }]);
    expect(vm.front.text).toBeUndefined();
  });

  it('listening: front audio replayed on back, transcription and comparison', () => {
    const { source, played } = createSource({
      type: CARD_TYPES.LISTENING,
      backText: "I'm tired now.",
      frontMedia: [audioFront],
    });

    const vm = buildReviewViewModel(source);

    expect(vm.answer.kind).toBe('listening');
    // Back shows the transcript and replays the same front audio.
    expect(vm.back.text).toBe("I'm tired now.");
    playAudio(vm.front.audio);
    playAudio(vm.back.audio);
    expect(played).toEqual(['file://a.m4a', 'file://a.m4a']);

    if (vm.answer.kind !== 'listening') {
      throw new Error('expected listening');
    }
    expect(vm.answer.checkAnswer('IM tired now').correct).toBe(true);
    expect(vm.answer.checkAnswer('errado').correct).toBe(false);
  });

  it('listening: exposes recording controls for the user response', () => {
    const { source, spoken, recordingCalls } = createSource(
      {
        type: CARD_TYPES.LISTENING,
        backText: 'hello',
        frontMedia: [],
      },
      { isRecording: true, recordedUri: 'file://me.m4a' },
    );

    const vm = buildReviewViewModel(source);

    if (vm.answer.kind !== 'listening') {
      throw new Error('expected listening');
    }
    expect(vm.answer.isRecording).toBe(true);
    expect(vm.answer.recordedUri).toBe('file://me.m4a');
    vm.answer.onPlayRecording();
    expect(recordingCalls.play).toBe(1);

    // Without file media, front audio falls back to transcript TTS.
    playTts(vm.front.audio);
    expect(spoken).toEqual([{ side: 'front', speed: TTS_PLAYBACK_SPEEDS.SLOW }]);
  });

  it('pronunciation: text on front, model audio on back and recording callbacks', () => {
    const { source, played, recordingCalls } = createSource(
      {
        type: CARD_TYPES.PRONUNCIATION,
        frontText: "I'm tired now.",
        backMedia: [audioBack],
      },
      { isRecording: true, recordedUri: 'file://rec.m4a' },
    );

    const vm = buildReviewViewModel(source);

    // Front: text to pronounce. Back: model audio (no audio on front).
    expect(vm.front.text).toBe("I'm tired now.");
    expect(vm.front.audio).toBeUndefined();

    expect(vm.answer.kind).toBe('recording');
    if (vm.answer.kind !== 'recording') {
      throw new Error('expected recording');
    }
    expect(vm.answer.isRecording).toBe(true);
    expect(vm.answer.recordedUri).toBe('file://rec.m4a');

    playAudio(vm.back.audio);
    expect(played).toEqual(['file://b.m4a']);

    vm.answer.onStopRecording();
    expect(recordingCalls.stop).toBe(1);
  });

  it('pronunciation in TTS mode: back reads text via TTS when there is no audio file', () => {
    const { source, spoken } = createSource({
      type: CARD_TYPES.PRONUNCIATION,
      frontText: "I'm tired now.",
      backText: "I'm tired now.",
      backMedia: [],
    });

    const vm = buildReviewViewModel(source);

    // Without file media, back model audio falls back to live TTS.
    playTts(vm.back.audio);
    expect(spoken).toEqual([{ side: 'back', speed: TTS_PLAYBACK_SPEEDS.SLOW }]);
  });
});
