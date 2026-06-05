import { ptBR } from '@/strings/locales/pt-BR';

import { getGreeting } from './getGreeting';

describe('getGreeting', () => {
  it('saúda com "Bom dia" pela manhã', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 9, 0, 0))).toBe('Bom dia 👋');
  });

  it('saúda com "Boa tarde" à tarde', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 15, 0, 0))).toBe('Boa tarde 👋');
  });

  it('saúda com "Boa noite" à noite', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 21, 0, 0))).toBe('Boa noite 👋');
  });

  it('trata o meio-dia (12h) como tarde', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 12, 0, 0))).toBe('Boa tarde 👋');
  });

  it('trata as 18h como noite', () => {
    expect(getGreeting(ptBR.home.greeting, new Date(2026, 5, 2, 18, 0, 0))).toBe('Boa noite 👋');
  });
});
