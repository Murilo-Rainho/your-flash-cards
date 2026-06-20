export type ParsedClozeFront = {
  before: string;
  gap: string;
  after: string;
};

const CLOZE_GAP_PATTERN = /\{([^{}]*)\}/g;

/**
 * Reads a legacy cloze sentence (1 blank in `{text}` format) and splits the parts.
 * Kept as the base of the legacy card bridge — see `clozeContentFromLegacy`.
 */
export function parseClozeFront(front: string): ParsedClozeFront | null {
  const matches = [...front.matchAll(CLOZE_GAP_PATTERN)];

  if (matches.length !== 1) {
    return null;
  }

  const match = matches[0];
  const gap = match[1] ?? '';

  if (!gap.trim()) {
    return null;
  }

  const before = front.slice(0, match.index);
  const after = front.slice(match.index + match[0].length);

  return { before, gap, after };
}

/**
 * Extracts the answer from a legacy sentence by comparing front (`{hint}`) and full back.
 * Used only to rebuild `ClozeContent` from legacy cards.
 */
export function extractExpectedClozeAnswer(front: string, back: string): string | null {
  const parsed = parseClozeFront(front);

  if (!parsed) {
    return null;
  }

  const { before, after } = parsed;

  if (!back.startsWith(before) || !back.endsWith(after)) {
    return null;
  }

  const expected = back.slice(before.length, back.length - after.length);

  if (!expected.trim()) {
    return null;
  }

  return expected;
}

/**
 * Canonical normalization of typed answers (cloze/typing/listening): trims edges, lowercases,
 * strips punctuation (keeps accented letters and digits), and collapses internal spaces.
 * Reference for answer comparison across the app.
 */
export function normalizeStudyAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}
