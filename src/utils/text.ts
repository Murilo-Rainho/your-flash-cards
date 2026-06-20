/** Splits a comma-separated tag string into a clean list (no empty entries). */
export function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
