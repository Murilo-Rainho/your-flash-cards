import { enUS } from '@/strings/locales/en-US';
import { ptBR } from '@/strings/locales/pt-BR';

import { localizeCardFieldErrors } from './localizeCardFieldErrors';

describe('localizeCardFieldErrors', () => {
  it('localizes cloze validation errors to English', () => {
    expect(
      localizeCardFieldErrors(
        {
          frontText: 'Marque ao menos uma lacuna na frase.',
          backText: 'Cada lacuna precisa de ao menos uma resposta aceita.',
          frontMedia: 'Preencher lacuna aceita apenas texto.',
        },
        enUS.cards,
      ),
    ).toEqual({
      frontText: 'Mark at least one blank in the sentence.',
      backText: 'Each blank needs at least one accepted answer.',
      frontMedia: 'Fill-in-the-blank cards accept text only.',
    });
  });

  it('keeps Portuguese strings when Portuguese is selected', () => {
    expect(
      localizeCardFieldErrors({ frontText: 'Marque ao menos uma lacuna na frase.' }, ptBR.cards),
    ).toEqual({ frontText: 'Marque ao menos uma lacuna na frase.' });
  });

  it('leaves unrelated messages untouched', () => {
    expect(localizeCardFieldErrors({ deckId: 'Escolha um deck.' }, enUS.cards)).toEqual({
      deckId: 'Escolha um deck.',
    });
  });
});
