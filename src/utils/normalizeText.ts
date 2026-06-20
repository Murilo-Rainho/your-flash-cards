/**
 * Tag text normalization (§11/§30.7).
 *
 * - `normalizeTagName`: display spelling (trim + collapse internal spaces).
 * - `normalizeTagKey`: uniqueness key (no accents, lowercase) — ensures "Verb"
 *   and "verb" are the same tag.
 */
export function normalizeTagName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeTagKey(value: string): string {
  return normalizeTagName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
