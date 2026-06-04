import {
  composeClozeFront,
  extractExpectedClozeAnswer,
  isClozeAnswerCorrect,
  normalizeStudyAnswer,
  parseClozeFront,
  toClozeDisplayFront,
} from './cloze';

describe('composeClozeFront', () => {
  it('composes before, gap, and after with braces', () => {
    expect(composeClozeFront("I'm ", 'cansado', ' now')).toBe("I'm {cansado} now");
  });

  it('returns null when gap is empty or whitespace', () => {
    expect(composeClozeFront("I'm ", '', ' now')).toBeNull();
    expect(composeClozeFront("I'm ", '   ', ' now')).toBeNull();
  });
});

describe('parseClozeFront', () => {
  it('parses a single cloze gap', () => {
    expect(parseClozeFront("I'm {cansado} now")).toEqual({
      before: "I'm ",
      gap: 'cansado',
      after: ' now',
    });
  });

  it('returns null when there is no gap', () => {
    expect(parseClozeFront("I'm tired now")).toBeNull();
  });

  it('returns null when there are multiple gaps', () => {
    expect(parseClozeFront('{a} and {b}')).toBeNull();
  });

  it('returns null when the gap is empty', () => {
    expect(parseClozeFront("I'm {} now")).toBeNull();
  });
});

describe('toClozeDisplayFront', () => {
  it('replaces the gap with underscores for review display', () => {
    expect(toClozeDisplayFront("I'm {cansado} now")).toBe("I'm ____ now");
  });

  it('returns null for invalid fronts', () => {
    expect(toClozeDisplayFront("I'm tired now")).toBeNull();
  });
});

describe('extractExpectedClozeAnswer', () => {
  it('extracts the middle segment from an aligned back', () => {
    expect(extractExpectedClozeAnswer("I'm {cansado} now", "I'm tired now")).toBe('tired');
  });

  it('returns null when prefix or suffix does not match', () => {
    expect(extractExpectedClozeAnswer("I'm {cansado} now", 'I am tired now')).toBeNull();
    expect(extractExpectedClozeAnswer("I'm {cansado} now", "I'm tired")).toBeNull();
    expect(extractExpectedClozeAnswer("I'm {cansado} now", "I'm tired tonight")).toBeNull();
  });

  it('returns null when front is invalid', () => {
    expect(extractExpectedClozeAnswer("I'm ____ now", "I'm tired now")).toBeNull();
  });
});

describe('normalizeStudyAnswer', () => {
  it('trims, lowercases, and collapses whitespace', () => {
    expect(normalizeStudyAnswer('  Tired  ')).toBe('tired');
    expect(normalizeStudyAnswer('TIRED!')).toBe('tired');
  });
});

describe('isClozeAnswerCorrect', () => {
  it('compares normalized user input with the expected gap from back', () => {
    expect(isClozeAnswerCorrect('tired', "I'm {cansado} now", "I'm tired now")).toBe(true);
    expect(isClozeAnswerCorrect(' TIRED ', "I'm {cansado} now", "I'm tired now")).toBe(true);
    expect(isClozeAnswerCorrect('sleepy', "I'm {cansado} now", "I'm tired now")).toBe(false);
  });

  it('returns false when extraction fails', () => {
    expect(isClozeAnswerCorrect('tired', "I'm tired now", "I'm tired now")).toBe(false);
  });
});

describe('compose and parse round-trip', () => {
  it('preserves before, gap, and after', () => {
    const composed = composeClozeFront('Hello ', 'world', '!');
    expect(composed).not.toBeNull();
    expect(parseClozeFront(composed!)).toEqual({
      before: 'Hello ',
      gap: 'world',
      after: '!',
    });
  });
});
