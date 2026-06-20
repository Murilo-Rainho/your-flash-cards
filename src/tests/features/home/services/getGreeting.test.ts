import { describe, expect, it } from '@jest/globals';

import { ptBR } from '@/strings/locales/pt-BR';

import { getGreeting } from '@/features/home/services/getGreeting';

describe('getGreeting', () => {
  it('greets with "Bom dia" in the morning', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 9, 0, 0))).toBe('Bom dia');
  });

  it('greets with "Boa tarde" in the afternoon', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 15, 0, 0))).toBe('Boa tarde');
  });

  it('greets with "Boa noite" at night', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 21, 0, 0))).toBe('Boa noite');
  });

  it('treats noon (12:00) as afternoon', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 12, 0, 0))).toBe('Boa tarde');
  });

  it('treats 18:00 as night', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 18, 0, 0))).toBe('Boa noite');
  });
});
