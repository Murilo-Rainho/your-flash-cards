import { describe, expect, it } from '@jest/globals';

import { normalizeTagKey, normalizeTagName } from './normalizeText';

describe('normalizeTagName', () => {
  it('trims edges and collapses internal whitespace', () => {
    expect(normalizeTagName('  phrasal   verbs  ')).toBe('phrasal verbs');
  });

  it('preserves text casing', () => {
    expect(normalizeTagName('Travel')).toBe('Travel');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeTagName('   ')).toBe('');
  });
});

describe('normalizeTagKey', () => {
  it('lowercases and strips accents', () => {
    expect(normalizeTagKey('Ação')).toBe('acao');
  });

  it('generates the same key for case and spacing variations', () => {
    expect(normalizeTagKey('  Verb ')).toBe('verb');
    expect(normalizeTagKey('verb')).toBe('verb');
  });

  it('keeps singular and plural as distinct keys', () => {
    expect(normalizeTagKey('verb')).not.toBe(normalizeTagKey('verbs'));
  });
});
