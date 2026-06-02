/**
 * Idiomas suportados para os pares de uma Coleção (idioma base → idioma alvo, §5.1).
 * Lista inicial baseada nos exemplos do contrato; sem lógica, apenas constantes.
 */
export const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];
