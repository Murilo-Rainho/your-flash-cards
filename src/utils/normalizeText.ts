/**
 * Normalização de texto de tags (§11/§30.7).
 *
 * - `normalizeTagName`: grafia de exibição (trim + colapsa espaços internos).
 * - `normalizeTagKey`: chave de unicidade (sem acento, minúscula) — garante que "Verb"
 *   e "verb" sejam a mesma tag.
 */
export function normalizeTagName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeTagKey(value: string): string {
  return normalizeTagName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
