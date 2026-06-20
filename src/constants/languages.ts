/**
 * Supported languages for a Collection language pair (base → target, §5.1).
 * Initial list based on contract examples; no logic, constants only.
 */
export const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

/** Maps Collection language to the BCP-47 code used by local TTS. */
export const LANGUAGE_SPEECH_CODES: Record<LanguageCode, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
  ja: 'ja-JP',
};

/** Converts a language code to a speech code (BCP-47), falling back to `en-US`. */
export function toSpeechLanguage(code: string | undefined): string {
  return LANGUAGE_SPEECH_CODES[code as LanguageCode] ?? 'en-US';
}
