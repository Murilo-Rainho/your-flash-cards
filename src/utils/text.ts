/** Divide uma string de tags separadas por vírgula em uma lista limpa (sem vazios). */
export function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
