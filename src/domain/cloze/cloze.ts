export type ParsedClozeFront = {
  before: string;
  gap: string;
  after: string;
};

const CLOZE_GAP_PATTERN = /\{([^{}]*)\}/g;

export function composeClozeFront(before: string, gap: string, after: string): string | null {
  const trimmedGap = gap.trim();

  if (!trimmedGap) {
    return null;
  }

  return `${before}{${trimmedGap}}${after}`;
}

export function composeClozeBack(before: string, gap: string, after: string): string | null {
  const trimmedGap = gap.trim();

  if (!trimmedGap) {
    return null;
  }

  return `${before}${trimmedGap}${after}`;
}

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

export function toClozeDisplayFront(front: string): string | null {
  const parsed = parseClozeFront(front);

  if (!parsed) {
    return null;
  }

  return `${parsed.before}____${parsed.after}`;
}

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

export function normalizeStudyAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isClozeAnswerCorrect(user: string, front: string, back: string): boolean {
  const expected = extractExpectedClozeAnswer(front, back);

  if (expected === null) {
    return false;
  }

  return normalizeStudyAnswer(user) === normalizeStudyAnswer(expected);
}
