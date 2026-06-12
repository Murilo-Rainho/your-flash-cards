import { extractExpectedClozeAnswer, normalizeStudyAnswer, parseClozeFront } from './cloze';

describe('parseClozeFront (legado)', () => {
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

  it('returns null when there are multiple gaps (frente legada tinha 1 lacuna)', () => {
    expect(parseClozeFront('{a} and {b}')).toBeNull();
  });

  it('returns null when the gap is empty', () => {
    expect(parseClozeFront("I'm {} now")).toBeNull();
  });
});

describe('extractExpectedClozeAnswer (legado)', () => {
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

  it('preserves accented letters and numbers', () => {
    expect(normalizeStudyAnswer('Café 3!')).toBe('café 3');
  });
});
