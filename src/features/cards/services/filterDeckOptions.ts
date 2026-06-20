import { matchesSearchText, normalizeSearchText } from '@/utils/search';

type DeckOption = {
  value: string;
  label: string;
};

/** Mantém o deck selecionado visível e fixa-o antes dos demais resultados. */
export function filterDeckOptions<T extends DeckOption>(
  options: readonly T[],
  query: string,
  selectedValue: string,
): T[] {
  const selected = options.find((option) => option.value === selectedValue);
  const normalizedQuery = normalizeSearchText(query);
  const matches = options.filter(
    (option) =>
      option.value !== selectedValue &&
      (!normalizedQuery || matchesSearchText(option.label, normalizedQuery)),
  );

  return selected ? [selected, ...matches] : matches;
}
