/** Normaliza consultas locais para correspondência parcial amigável. */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function matchesSearchText(value: string, query: string): boolean {
  return normalizeSearchText(value).includes(normalizeSearchText(query));
}

export function filterNamedItems<T extends { name: string }>(
  items: readonly T[],
  query: string,
): T[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [...items];
  }

  return items.filter((item) => normalizeSearchText(item.name).includes(normalizedQuery));
}
