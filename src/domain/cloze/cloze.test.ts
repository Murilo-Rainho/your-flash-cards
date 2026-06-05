import {
  composeClozeBack,
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

  it('trims each part and joins with a single space', () => {
    expect(composeClozeFront("I'm", 'cansado', 'now')).toBe("I'm {cansado} now");
    expect(composeClozeFront('  I am  ', '  cansado  ', '  now  ')).toBe('I am {cansado} now');
  });

  it('omits empty before/after parts without leaving stray spaces', () => {
    expect(composeClozeFront('', 'cansado', 'now')).toBe('{cansado} now');
    expect(composeClozeFront('I am', 'cansado', '')).toBe('I am {cansado}');
  });

  it('returns null when gap is empty or whitespace', () => {
    expect(composeClozeFront("I'm ", '', ' now')).toBeNull();
    expect(composeClozeFront("I'm ", '   ', ' now')).toBeNull();
  });
});

describe('composeClozeBack', () => {
  it('composes before, gap, and after without braces', () => {
    expect(composeClozeBack("I'm ", 'tired', ' now')).toBe("I'm tired now");
  });

  it('trims each part and joins with a single space', () => {
    expect(composeClozeBack("I'm", 'tired', 'now')).toBe("I'm tired now");
    expect(composeClozeBack('  I am  ', '  tired  ', '  now  ')).toBe('I am tired now');
  });

  it('omits empty before/after parts without leaving stray spaces', () => {
    expect(composeClozeBack('', 'tired', 'now')).toBe('tired now');
    expect(composeClozeBack('I am', 'tired', '')).toBe('I am tired');
  });

  it('returns null when gap is empty or whitespace', () => {
    expect(composeClozeBack("I'm ", '', ' now')).toBeNull();
    expect(composeClozeBack("I'm ", '   ', ' now')).toBeNull();
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
  it('keeps the base-language hint in braces for review display', () => {
    expect(toClozeDisplayFront("I'm {cansado} now")).toBe("I'm {cansado} now");
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
  it('keeps front and back aligned so the expected answer can be extracted', () => {
    const composedFront = composeClozeFront('I am', 'cansado', 'now');
    const composedBack = composeClozeBack('I am', 'tired', 'now');
    expect(composedFront).toBe('I am {cansado} now');
    expect(composedBack).toBe('I am tired now');
    expect(parseClozeFront(composedFront!)).toEqual({
      before: 'I am ',
      gap: 'cansado',
      after: ' now',
    });
    expect(extractExpectedClozeAnswer(composedFront!, composedBack!)).toBe('tired');
  });
});
