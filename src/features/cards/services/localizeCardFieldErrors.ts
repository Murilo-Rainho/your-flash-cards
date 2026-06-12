import type { StringCatalog } from '@/strings/types';
import type { FieldErrors } from '@/utils/validation';

import { CARD_FIELD_ERROR_CODES, type CardFieldErrorCode } from './cardValidationErrorCodes';

const cardFieldErrorKeys = {
  [CARD_FIELD_ERROR_CODES.clozeNoBlanks]: 'clozeNoBlanks',
  [CARD_FIELD_ERROR_CODES.clozeBlankWithoutAnswer]: 'clozeBlankWithoutAnswer',
  [CARD_FIELD_ERROR_CODES.clozeTextOnly]: 'clozeTextOnly',
} as const satisfies Record<CardFieldErrorCode, keyof StringCatalog['cards']['validation']>;

function getCardFieldErrorKey(
  errorCode: string,
): keyof StringCatalog['cards']['validation'] | undefined {
  if (!Object.prototype.hasOwnProperty.call(cardFieldErrorKeys, errorCode)) {
    return undefined;
  }

  return cardFieldErrorKeys[errorCode as CardFieldErrorCode];
}

export function localizeCardFieldErrors<Field extends string>(
  fieldErrors: FieldErrors<Field>,
  cardStrings: StringCatalog['cards'],
): FieldErrors<Field> {
  const localized: FieldErrors<Field> = {};
  const entries = Object.entries(fieldErrors) as Array<[Field, string | undefined]>;

  for (const [field, message] of entries) {
    if (!message) {
      continue;
    }

    const key = getCardFieldErrorKey(message);
    localized[field] = key ? cardStrings.validation[key] : message;
  }

  return localized;
}
