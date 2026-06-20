import { describe, expect, it } from '@jest/globals';

import { enUS } from '@/strings/locales/en-US';
import { ptBR } from '@/strings/locales/pt-BR';

import { CARD_FIELD_ERROR_CODES } from '@/features/cards/services/cardValidationErrorCodes';
import { localizeCardFieldErrors } from '@/features/cards/services/localizeCardFieldErrors';

describe('localizeCardFieldErrors', () => {
  it('localizes cloze validation errors to English', () => {
    expect(
      localizeCardFieldErrors(
        {
          frontText: CARD_FIELD_ERROR_CODES.clozeNoBlanks,
          backText: CARD_FIELD_ERROR_CODES.clozeBlankWithoutAnswer,
          frontMedia: CARD_FIELD_ERROR_CODES.clozeTextOnly,
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
      localizeCardFieldErrors({ frontText: CARD_FIELD_ERROR_CODES.clozeNoBlanks }, ptBR.cards),
    ).toEqual({ frontText: 'Marque ao menos uma lacuna na frase.' });
  });

  it('does not localize legacy prose by matching backend sentences', () => {
    expect(
      localizeCardFieldErrors({ frontText: 'Marque ao menos uma lacuna na frase.' }, enUS.cards),
    ).toEqual({ frontText: 'Marque ao menos uma lacuna na frase.' });
  });

  it('leaves unrelated messages untouched', () => {
    expect(localizeCardFieldErrors({ deckId: 'Escolha um deck.' }, enUS.cards)).toEqual({
      deckId: 'Escolha um deck.',
    });
  });
});
