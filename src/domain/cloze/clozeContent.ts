import { extractExpectedClozeAnswer, normalizeStudyAnswer, parseClozeFront } from './cloze';

/**
 * Structured model of a cloze card (§9): the sentence is a sequence of text segments and
 * blanks. Each blank has an optional hint (shown in `{braces}` on the front) and ONE OR MORE
 * accepted answers (`answers[0]` is primary, used to compose back text and feedback).
 *
 * Source of truth for cloze content, persisted in `Card.cloze` (`cloze_data` column).
 * `Card.front`/`Card.back` remain derived from this model for display and compatibility.
 * Pure TS (rule 01): no React/Expo/infra.
 */
export type ClozeTextSegment = { kind: 'text'; text: string };
export type ClozeBlankSegment = { kind: 'blank'; hint?: string; answers: string[] };
export type ClozeSegment = ClozeTextSegment | ClozeBlankSegment;
export type ClozeContent = { segments: ClozeSegment[] };

export type ClozeValidationError = 'no-blanks' | 'blank-without-answer';
export type ClozeBlankAnswerCheck = {
  correct: boolean;
  /** Alternative shown first in feedback: matched answer when correct, primary when wrong. */
  expected: string;
  acceptedAnswers: string[];
  expectedIndex: number;
};

// Local regex (matchAll per call; no shared lastIndex state).
const CLOZE_GAP_PATTERN = /\{([^{}]*)\}/g;

/** Character position of each `{...}` in the sentence, in blank order. */
export type ClozeBlankRange = { start: number; end: number };

/**
 * Splits a sentence with `{hint}` markers into segments (text/blank), preserving text exactly
 * as written (spaces included). Each `{...}` becomes a blank with `hint` = brace content
 * (empty becomes `undefined`) and empty `answers` (answers live outside the sentence).
 * Also returns ranges for each `{...}` so the editor can rewrite hints in place.
 */
export function parseClozeTemplate(sentence: string): {
  segments: ClozeSegment[];
  blankRanges: ClozeBlankRange[];
} {
  const segments: ClozeSegment[] = [];
  const blankRanges: ClozeBlankRange[] = [];
  let lastIndex = 0;

  for (const match of sentence.matchAll(CLOZE_GAP_PATTERN)) {
    const index = match.index ?? 0;
    const text = sentence.slice(lastIndex, index);

    if (text) {
      segments.push({ kind: 'text', text });
    }

    const hint = match[1] ?? '';
    segments.push({ kind: 'blank', hint: hint.trim() ? hint : undefined, answers: [] });
    blankRanges.push({ start: index, end: index + match[0].length });
    lastIndex = index + match[0].length;
  }

  const tail = sentence.slice(lastIndex);

  if (tail) {
    segments.push({ kind: 'text', text: tail });
  }

  return { segments, blankRanges };
}

/** Blanks (in order) from cloze content. */
export function getClozeBlanks(content: ClozeContent): ClozeBlankSegment[] {
  return content.segments.filter(
    (segment): segment is ClozeBlankSegment => segment.kind === 'blank',
  );
}

/**
 * Builds final `ClozeContent` from the sentence (with `{}`) and per-blank answers aligned to
 * parsed blank order. Answers are trimmed; empty ones discarded.
 */
export function buildClozeContent(
  sentence: string,
  answersByBlank: readonly (readonly string[])[],
): ClozeContent {
  const { segments } = parseClozeTemplate(sentence);
  let blankIndex = 0;

  const merged = segments.map<ClozeSegment>((segment) => {
    if (segment.kind !== 'blank') {
      return segment;
    }

    const answers = (answersByBlank[blankIndex] ?? [])
      .map((answer) => answer.trim())
      .filter(Boolean);
    blankIndex += 1;
    return { kind: 'blank', hint: segment.hint, answers };
  });

  return { segments: merged };
}

/** Sentence with hint in `{braces}` per blank (stored in `Card.front` / shown in review). */
export function composeClozeFront(content: ClozeContent): string {
  return content.segments
    .map((segment) => (segment.kind === 'text' ? segment.text : `{${segment.hint ?? ''}}`))
    .join('');
}

/** Complete sentence with primary answer (`answers[0]`) per blank (stored in `Card.back`). */
export function composeClozeBack(content: ClozeContent): string {
  return content.segments
    .map((segment) => (segment.kind === 'text' ? segment.text : (segment.answers[0] ?? '')))
    .join('');
}

/**
 * Complete sentence using a selected alternative per blank. If a blank has no selection, falls
 * back to the primary answer — same fallback as `composeClozeBack`.
 */
export function composeClozeBackWithAnswers(
  content: ClozeContent,
  answersByBlank: readonly string[],
): string {
  let blankIndex = 0;

  return content.segments
    .map((segment) => {
      if (segment.kind === 'text') {
        return segment.text;
      }

      const selected = answersByBlank[blankIndex]?.trim();
      blankIndex += 1;
      return selected || segment.answers[0] || '';
    })
    .join('');
}

/** Accepted answers ready for display/checking: trimmed with empties removed. */
export function getAcceptedClozeAnswers(answers: readonly string[]): string[] {
  return answers.map((answer) => answer.trim()).filter(Boolean);
}

export function checkClozeBlankAnswer(
  answers: readonly string[],
  typed: string,
): ClozeBlankAnswerCheck {
  const acceptedAnswers = getAcceptedClozeAnswers(answers);
  const normalizedTyped = normalizeStudyAnswer(typed);
  const matchedIndex = normalizedTyped
    ? acceptedAnswers.findIndex((answer) => normalizeStudyAnswer(answer) === normalizedTyped)
    : -1;
  const expectedIndex = matchedIndex >= 0 ? matchedIndex : 0;

  return {
    correct: matchedIndex >= 0,
    expected: acceptedAnswers[expectedIndex] ?? '',
    acceptedAnswers,
    expectedIndex,
  };
}

/**
 * Correct answer for a blank: normalized input matches ANY accepted answer (also normalized).
 * Reuses the project's canonical normalization.
 */
export function checkClozeBlank(answers: readonly string[], typed: string): boolean {
  return checkClozeBlankAnswer(answers, typed).correct;
}

/** Validates cloze content: ≥ 1 blank and each blank with ≥ 1 accepted answer. */
export function validateClozeContent(content: ClozeContent): ClozeValidationError | null {
  const blanks = getClozeBlanks(content);

  if (blanks.length === 0) {
    return 'no-blanks';
  }

  if (blanks.some((blank) => blank.answers.length === 0)) {
    return 'blank-without-answer';
  }

  return null;
}

export function serializeClozeContent(content: ClozeContent): string {
  return JSON.stringify(content);
}

/**
 * Defensively deserializes persisted `cloze_data`: missing/corrupt data returns `null` (caller
 * falls back to legacy bridge from `front`/`back`).
 */
export function deserializeClozeContent(raw: string | null | undefined): ClozeContent | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !Array.isArray((parsed as { segments?: unknown }).segments)
    ) {
      return null;
    }

    const segments: ClozeSegment[] = [];

    for (const segment of (parsed as { segments: unknown[] }).segments) {
      if (typeof segment !== 'object' || segment === null) {
        return null;
      }

      const candidate = segment as {
        kind?: unknown;
        text?: unknown;
        hint?: unknown;
        answers?: unknown;
      };

      if (candidate.kind === 'text' && typeof candidate.text === 'string') {
        segments.push({ kind: 'text', text: candidate.text });
      } else if (candidate.kind === 'blank' && Array.isArray(candidate.answers)) {
        const answers = candidate.answers.filter(
          (answer): answer is string => typeof answer === 'string',
        );
        const hint = typeof candidate.hint === 'string' ? candidate.hint : undefined;
        segments.push({ kind: 'blank', hint, answers });
      } else {
        return null;
      }
    }

    return { segments };
  } catch {
    return null;
  }
}

/**
 * Rebuilds `ClozeContent` (1 blank / 1 answer) from legacy front/back.
 * Compatibility for cloze cards created before multi-blank support.
 */
export function clozeContentFromLegacy(front: string, back: string): ClozeContent {
  const parsed = parseClozeFront(front);

  if (!parsed) {
    return { segments: front ? [{ kind: 'text', text: front }] : [] };
  }

  const expected = extractExpectedClozeAnswer(front, back);
  const segments: ClozeSegment[] = [];

  if (parsed.before) {
    segments.push({ kind: 'text', text: parsed.before });
  }

  segments.push({
    kind: 'blank',
    hint: parsed.gap.trim() ? parsed.gap : undefined,
    answers: expected ? [expected] : [],
  });

  if (parsed.after) {
    segments.push({ kind: 'text', text: parsed.after });
  }

  return { segments };
}

/** Cloze content for a card: uses structured (`card.cloze`) or legacy front/back bridge. */
export function resolveClozeContent(card: {
  front: string;
  back: string;
  cloze?: ClozeContent;
}): ClozeContent {
  return card.cloze ?? clozeContentFromLegacy(card.front, card.back);
}
