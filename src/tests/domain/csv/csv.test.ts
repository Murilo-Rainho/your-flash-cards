import { describe, expect, it } from '@jest/globals';

import { escapeCsvField, parseCsv, serializeCsv } from '@/domain/csv/csv';

describe('escapeCsvField', () => {
  it('leaves plain values untouched', () => {
    expect(escapeCsvField('house')).toBe('house');
  });

  it('quotes values with commas, quotes or line breaks', () => {
    expect(escapeCsvField('home,basic')).toBe('"home,basic"');
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('serializeCsv', () => {
  it('joins fields and rows', () => {
    const csv = serializeCsv([
      ['a', 'b'],
      ['c', 'd'],
    ]);

    expect(csv).toBe('a,b\nc,d');
  });

  it('escapes fields that need quoting', () => {
    const csv = serializeCsv([['with,comma', 'plain']]);

    expect(csv).toBe('"with,comma",plain');
  });
});

describe('parseCsv', () => {
  it('parses simple rows', () => {
    expect(parseCsv('a,b\nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('handles quoted fields with commas, escaped quotes and newlines', () => {
    const content = '"home,basic","say ""hi""","line1\nline2"';

    expect(parseCsv(content)).toEqual([['home,basic', 'say "hi"', 'line1\nline2']]);
  });

  it('tolerates CRLF and lone CR line endings', () => {
    expect(parseCsv('a,b\r\nc,d\re,f')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
      ['e', 'f'],
    ]);
  });

  it('drops a trailing empty line', () => {
    expect(parseCsv('a,b\n')).toEqual([['a', 'b']]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('round-trips through serialize', () => {
    const rows = [
      ['deck', 'type', 'front'],
      ['Básico', 'vocabulary', 'a "quoted", value\nwith newline'],
    ];

    expect(parseCsv(serializeCsv(rows))).toEqual(rows);
  });
});
