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

/** Mapeamento de idioma da Coleção para o código BCP-47 usado pelo TTS local. */
export const LANGUAGE_SPEECH_CODES: Record<LanguageCode, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
  ja: 'ja-JP',
};

/** Converte um código de idioma em código de fala (BCP-47), com fallback para `en-US`. */
export function toSpeechLanguage(code: string | undefined): string {
  return LANGUAGE_SPEECH_CODES[code as LanguageCode] ?? 'en-US';
}
