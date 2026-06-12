import { describe, expect, it } from '@jest/globals';

import { normalizeTagKey, normalizeTagName } from './normalizeText';

describe('normalizeTagName', () => {
  it('remove espaços nas pontas e colapsa espaços internos', () => {
    expect(normalizeTagName('  phrasal   verbs  ')).toBe('phrasal verbs');
  });

  it('preserva a grafia (caixa) do texto', () => {
    expect(normalizeTagName('Travel')).toBe('Travel');
  });

  it('retorna string vazia para entrada só com espaços', () => {
    expect(normalizeTagName('   ')).toBe('');
  });
});

describe('normalizeTagKey', () => {
  it('coloca em minúsculas e remove acentos', () => {
    expect(normalizeTagKey('Ação')).toBe('acao');
  });

  it('gera a mesma chave para variações de caixa e espaço', () => {
    expect(normalizeTagKey('  Verb ')).toBe('verb');
    expect(normalizeTagKey('verb')).toBe('verb');
  });

  it('mantém singular e plural como chaves distintas', () => {
    expect(normalizeTagKey('verb')).not.toBe(normalizeTagKey('verbs'));
  });
});
