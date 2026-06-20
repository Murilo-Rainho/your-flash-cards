import { describe, expect, it } from '@jest/globals';

import {
  buildClozeContent,
  checkClozeBlank,
  checkClozeBlankAnswer,
  clozeContentFromLegacy,
  composeClozeBack,
  composeClozeBackWithAnswers,
  composeClozeFront,
  deserializeClozeContent,
  getClozeBlanks,
  parseClozeTemplate,
  resolveClozeContent,
  serializeClozeContent,
  validateClozeContent,
  type ClozeContent,
} from '@/domain/cloze/clozeContent';

describe('parseClozeTemplate', () => {
  it('splits a single-blank sentence preserving exact text', () => {
    const { segments, blankRanges } = parseClozeTemplate("I'm {cansado} now");
    expect(segments).toEqual([
      { kind: 'text', text: "I'm " },
      { kind: 'blank', hint: 'cansado', answers: [] },
      { kind: 'text', text: ' now' },
    ]);
    expect(blankRanges).toEqual([{ start: 4, end: 13 }]);
  });

  it('supports multiple blanks', () => {
    const { segments } = parseClozeTemplate('I would like {ambos} water {e} juice.');
    expect(segments).toEqual([
      { kind: 'text', text: 'I would like ' },
      { kind: 'blank', hint: 'ambos', answers: [] },
      { kind: 'text', text: ' water ' },
      { kind: 'blank', hint: 'e', answers: [] },
      { kind: 'text', text: ' juice.' },
    ]);
  });

  it('treats an empty brace as a hintless blank', () => {
    const { segments } = parseClozeTemplate('a {} b');
    expect(segments).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'blank', hint: undefined, answers: [] },
      { kind: 'text', text: ' b' },
    ]);
  });
});

describe('buildClozeContent', () => {
  it('aligns answers to blanks in order', () => {
    const content = buildClozeContent('I would like {ambos} water {e} juice.', [['both'], ['and']]);
    expect(getClozeBlanks(content)).toEqual([
      { kind: 'blank', hint: 'ambos', answers: ['both'] },
      { kind: 'blank', hint: 'e', answers: ['and'] },
    ]);
  });

  it('trims answers and drops empty ones', () => {
    const content = buildClozeContent('It was raining. {Mesmo assim}, we went hiking.', [
      ['  Still  ', 'Even so', '', '   ', 'Nevertheless'],
    ]);
    expect(getClozeBlanks(content)[0].answers).toEqual(['Still', 'Even so', 'Nevertheless']);
  });
});

describe('composeClozeFront / composeClozeBack', () => {
  const content = buildClozeContent('I would like {ambos} water {e} juice.', [
    ['both', 'the two'],
    ['and'],
  ]);

  it('front keeps the hints in braces', () => {
    expect(composeClozeFront(content)).toBe('I would like {ambos} water {e} juice.');
  });

  it('back fills the primary answer of each blank', () => {
    expect(composeClozeBack(content)).toBe('I would like both water and juice.');
  });

  it('back can fill a selected accepted answer per blank', () => {
    expect(composeClozeBackWithAnswers(content, ['the two', 'and'])).toBe(
      'I would like the two water and juice.',
    );
    expect(composeClozeBackWithAnswers(content, [])).toBe('I would like both water and juice.');
  });
});

describe('checkClozeBlank', () => {
  const answers = ['Still', 'Even so', 'Nevertheless'];

  it('accepts any of the answers after normalization', () => {
    expect(checkClozeBlank(answers, 'still')).toBe(true);
    expect(checkClozeBlank(answers, '  EVEN SO! ')).toBe(true);
    expect(checkClozeBlank(answers, 'nevertheless')).toBe(true);
  });

  it('rejects a non-matching or empty answer', () => {
    expect(checkClozeBlank(answers, 'however')).toBe(false);
    expect(checkClozeBlank(answers, '   ')).toBe(false);
  });
});

describe('checkClozeBlankAnswer', () => {
  const answers = ['Can I have', "I'd like"];

  it('uses the matching accepted answer as the first answer shown when correct', () => {
    expect(checkClozeBlankAnswer(answers, " i'd like! ")).toEqual({
      correct: true,
      expected: "I'd like",
      acceptedAnswers: ['Can I have', "I'd like"],
      expectedIndex: 1,
    });
  });

  it('uses the primary accepted answer as the first answer shown when wrong', () => {
    expect(checkClozeBlankAnswer(answers, 'may I get')).toEqual({
      correct: false,
      expected: 'Can I have',
      acceptedAnswers: ['Can I have', "I'd like"],
      expectedIndex: 0,
    });
  });
});

describe('validateClozeContent', () => {
  it('flags a sentence with no blanks', () => {
    expect(validateClozeContent(buildClozeContent('no blanks here', []))).toBe('no-blanks');
  });

  it('flags a blank without answers', () => {
    expect(validateClozeContent(buildClozeContent('a {x} b', [[]]))).toBe('blank-without-answer');
  });

  it('passes a valid multi-blank content', () => {
    expect(validateClozeContent(buildClozeContent('a {x} b {y}', [['1'], ['2']]))).toBeNull();
  });
});

describe('serialize / deserialize round-trip', () => {
  it('round-trips a content', () => {
    const content = buildClozeContent('a {x} b', [['one', 'uno']]);
    expect(deserializeClozeContent(serializeClozeContent(content))).toEqual(content);
  });

  it('returns null for missing or corrupt data', () => {
    expect(deserializeClozeContent(null)).toBeNull();
    expect(deserializeClozeContent('')).toBeNull();
    expect(deserializeClozeContent('not json')).toBeNull();
    expect(deserializeClozeContent('{"segments":[{"kind":"weird"}]}')).toBeNull();
  });
});

describe('legacy bridge', () => {
  it('rebuilds a single-blank/single-answer content from front/back', () => {
    const content = clozeContentFromLegacy("I'm {cansado} now", "I'm tired now");
    expect(content.segments).toEqual([
      { kind: 'text', text: "I'm " },
      { kind: 'blank', hint: 'cansado', answers: ['tired'] },
      { kind: 'text', text: ' now' },
    ]);
    // round-trips back to the legacy strings
    expect(composeClozeFront(content)).toBe("I'm {cansado} now");
    expect(composeClozeBack(content)).toBe("I'm tired now");
  });

  it('resolveClozeContent prefers the structured content when present', () => {
    const structured: ClozeContent = buildClozeContent('a {x} b', [['one']]);
    expect(resolveClozeContent({ front: 'ignored', back: 'ignored', cloze: structured })).toBe(
      structured,
    );
    expect(resolveClozeContent({ front: "I'm {cansado} now", back: "I'm tired now" })).toEqual(
      clozeContentFromLegacy("I'm {cansado} now", "I'm tired now"),
    );
  });
});
