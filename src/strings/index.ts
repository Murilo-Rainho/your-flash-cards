import { enUS } from './locales/en-US';
import { ptBR } from './locales/pt-BR';
import { DEFAULT_LOCALE, isLocaleCode, type LocaleCode, type StringCatalog } from './types';

const catalogs: Record<LocaleCode, StringCatalog> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

export function resolveStrings(locale: string): StringCatalog {
  if (isLocaleCode(locale)) {
    return catalogs[locale];
  }

  return catalogs[DEFAULT_LOCALE];
}

export { DEFAULT_LOCALE, SUPPORTED_LOCALES, isLocaleCode } from './types';
export type { LocaleCode, StringCatalog } from './types';
