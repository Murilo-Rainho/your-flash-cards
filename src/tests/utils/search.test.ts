import { describe, expect, it } from '@jest/globals';

import { filterNamedItems, matchesSearchText, normalizeSearchText } from '@/utils/search';

describe('local search helpers', () => {
  it('normalizes case, accents and repeated whitespace', () => {
    expect(normalizeSearchText('  AÇÃO   RÁPIDA ')).toBe('acao rapida');
  });

  it('matches partial text without case or accent sensitivity', () => {
    expect(matchesSearchText('Vocabulário de Viagem', 'VOCABULARIO')).toBe(true);
  });

  it('filters named items and preserves their existing order', () => {
    const items = [
      { id: 'food', name: 'Alimentação' },
      { id: 'travel', name: 'Viagem' },
      { id: 'business', name: 'Negócios' },
    ];

    expect(filterNamedItems(items, 'negocios')).toEqual([items[2]]);
    expect(filterNamedItems(items, '')).toEqual(items);
  });
});
