import { describe, expect, it } from '@jest/globals';

import { filterDeckOptions } from './filterDeckOptions';

const options = [
  { value: 'business', label: 'Business' },
  { value: 'food', label: 'Alimentação' },
  { value: 'travel', label: 'Travel' },
];

describe('filterDeckOptions', () => {
  it('keeps the selected deck first when it does not match the query', () => {
    expect(filterDeckOptions(options, 'travel', 'business')).toEqual([options[0], options[2]]);
  });

  it('matches names without accent sensitivity and does not duplicate the selected deck', () => {
    expect(filterDeckOptions(options, 'alimentacao', 'food')).toEqual([options[1]]);
  });

  it('preserves the existing order when there is no selected deck', () => {
    expect(filterDeckOptions(options, '', '')).toEqual(options);
  });
});
