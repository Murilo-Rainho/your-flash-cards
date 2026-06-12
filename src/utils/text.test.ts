import { describe, expect, it } from '@jest/globals';

import { splitTags } from './text';

describe('splitTags', () => {
  it('splits a comma-separated string into trimmed tags', () => {
    expect(splitTags('travel, listening , food')).toEqual(['travel', 'listening', 'food']);
  });

  it('drops empty segments', () => {
    expect(splitTags('a,, ,b,')).toEqual(['a', 'b']);
  });

  it('returns an empty array for blank input', () => {
    expect(splitTags('   ')).toEqual([]);
    expect(splitTags('')).toEqual([]);
  });
});
