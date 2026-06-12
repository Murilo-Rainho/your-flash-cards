import {
  insertClozeBlank,
  reconcileClozeAnswers,
  removeClozeBlank,
  rewriteClozeBlankHint,
  sanitizeClozeHint,
} from './clozeEditorOps';

describe('insertClozeBlank', () => {
  it('wraps the selected range and inserts an empty answer at the right index', () => {
    // "It was raining. Even so, we went hiking." — selecionar "Even so" (16..23)
    const sentence = 'It was raining. Even so, we went hiking.';
    const start = sentence.indexOf('Even so');
    const end = start + 'Even so'.length;

    const result = insertClozeBlank({ sentence, answers: [] }, start, end);

    expect(result.sentence).toBe('It was raining. {Even so}, we went hiking.');
    expect(result.answers).toEqual([['']]);
  });

  it('inserts the new blank answer in sentence order (between existing blanks)', () => {
    // já existe uma lacuna no fim; marca outra antes dela
    const sentence = 'a b {c}';
    const start = 2; // "b"
    const end = 3;

    const result = insertClozeBlank({ sentence, answers: [['existing']] }, start, end);

    expect(result.sentence).toBe('a {b} {c}');
    // a nova lacuna (b) vem antes da existente (c)
    expect(result.answers).toEqual([[''], ['existing']]);
  });

  it('ignores an empty selection', () => {
    const state = { sentence: 'abc', answers: [] };
    expect(insertClozeBlank(state, 1, 1)).toBe(state);
  });

  it('strips braces from the selected hint to avoid nested markers', () => {
    const result = insertClozeBlank({ sentence: 'x{y}z', answers: [['a']] }, 0, 5);
    expect(result.sentence).toBe('{xyz}');
  });
});

describe('rewriteClozeBlankHint', () => {
  it('rewrites the hint of the given blank only', () => {
    expect(rewriteClozeBlankHint('a {one} b {two}', 1, 'dois')).toBe('a {one} b {dois}');
  });

  it('sanitizes braces in the new hint', () => {
    expect(rewriteClozeBlankHint('a {one}', 0, 'x{y}')).toBe('a {xy}');
  });

  it('returns the sentence unchanged for an out-of-range index', () => {
    expect(rewriteClozeBlankHint('a {one}', 5, 'nope')).toBe('a {one}');
  });
});

describe('removeClozeBlank', () => {
  it('unwraps the blank keeping the hint text and drops its answers', () => {
    const result = removeClozeBlank({ sentence: 'a {one} b {two}', answers: [['1'], ['2']] }, 0);
    expect(result.sentence).toBe('a one b {two}');
    expect(result.answers).toEqual([['2']]);
  });

  it('returns state unchanged for an out-of-range index', () => {
    const state = { sentence: 'a {one}', answers: [['1']] };
    expect(removeClozeBlank(state, 9)).toBe(state);
  });
});

describe('reconcileClozeAnswers', () => {
  it('keeps answers when the blank count matches', () => {
    const answers = [['a'], ['b']];
    expect(reconcileClozeAnswers(answers, '{x} {y}')).toBe(answers);
  });

  it('pads with an empty answer when blanks were added', () => {
    expect(reconcileClozeAnswers([['a']], '{x} {y}')).toEqual([['a'], ['']]);
  });

  it('truncates when blanks were removed', () => {
    expect(reconcileClozeAnswers([['a'], ['b']], '{x}')).toEqual([['a']]);
  });
});

describe('sanitizeClozeHint', () => {
  it('removes braces', () => {
    expect(sanitizeClozeHint('a{b}c')).toBe('abc');
  });
});
