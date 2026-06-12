import type { StringCatalog } from '@/strings/types';
import type { FieldErrors } from '@/utils/validation';

const cardFieldErrorKeys = {
  'Marque ao menos uma lacuna na frase.': 'clozeNoBlanks',
  'Cada lacuna precisa de ao menos uma resposta aceita.': 'clozeBlankWithoutAnswer',
  'Preencher lacuna aceita apenas texto.': 'clozeTextOnly',
} as const satisfies Record<string, keyof StringCatalog['cards']['validation']>;

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

    const key = cardFieldErrorKeys[message as keyof typeof cardFieldErrorKeys];
    localized[field] = key ? cardStrings.validation[key] : message;
  }

  return localized;
}
