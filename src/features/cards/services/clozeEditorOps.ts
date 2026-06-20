import { parseClozeTemplate } from '@/domain/cloze/clozeContent';

/**
 * Pure cloze authoring operations on the sentence (with `{}`) and per-blank answers.
 * Extracted from `useClozeEditor` hook for testing without React. Keep alignment
 * between blank order in the sentence and the answers array.
 */
export type ClozeEditorState = { sentence: string; answers: string[][] };

/** Removes braces from hint text to avoid nested/invalid markers. */
export function sanitizeClozeHint(value: string): string {
  return value.replace(/[{}]/g, '');
}

function blankCount(sentence: string): number {
  return parseClozeTemplate(sentence).blankRanges.length;
}

/**
 * Adjusts the answers array to blank count after free sentence edit (best-effort,
 * by index): truncates when fewer blanks, pads with empty answer when more.
 */
export function reconcileClozeAnswers(answers: string[][], sentence: string): string[][] {
  const count = blankCount(sentence);

  if (answers.length === count) {
    return answers;
  }

  if (answers.length > count) {
    return answers.slice(0, count);
  }

  const next = [...answers];
  while (next.length < count) {
    next.push(['']);
  }
  return next;
}

/** Wraps span [start, end) in `{}` (becomes a blank) and inserts an empty answer in order. */
export function insertClozeBlank(
  state: ClozeEditorState,
  start: number,
  end: number,
): ClozeEditorState {
  const { sentence, answers } = state;

  if (end <= start) {
    return state;
  }

  const safeStart = Math.max(0, Math.min(start, sentence.length));
  const safeEnd = Math.max(safeStart, Math.min(end, sentence.length));
  const hint = sanitizeClozeHint(sentence.slice(safeStart, safeEnd));
  const { blankRanges } = parseClozeTemplate(sentence);
  const insertIndex = blankRanges.filter((range) => range.start < safeStart).length;

  const nextAnswers = [...answers];
  nextAnswers.splice(insertIndex, 0, ['']);

  return {
    sentence: `${sentence.slice(0, safeStart)}{${hint}}${sentence.slice(safeEnd)}`,
    answers: nextAnswers,
  };
}

/** Rewrites the hint (brace content) of blank `blankIndex`. */
export function rewriteClozeBlankHint(sentence: string, blankIndex: number, hint: string): string {
  const { blankRanges } = parseClozeTemplate(sentence);
  const range = blankRanges[blankIndex];

  if (!range) {
    return sentence;
  }

  return `${sentence.slice(0, range.start)}{${sanitizeClozeHint(hint)}}${sentence.slice(range.end)}`;
}

/** Removes blank `blankIndex` (keeps hint text as plain text) and drops its answers. */
export function removeClozeBlank(state: ClozeEditorState, blankIndex: number): ClozeEditorState {
  const { sentence, answers } = state;
  const { blankRanges } = parseClozeTemplate(sentence);
  const range = blankRanges[blankIndex];

  if (!range) {
    return state;
  }

  const hintText = sentence.slice(range.start + 1, range.end - 1);

  return {
    sentence: `${sentence.slice(0, range.start)}${hintText}${sentence.slice(range.end)}`,
    answers: answers.filter((_, index) => index !== blankIndex),
  };
}
