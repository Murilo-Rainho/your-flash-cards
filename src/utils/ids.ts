export type IdFactory = () => string;

/**
 * Gera ids locais estáveis o suficiente para o armazenamento offline.
 *
 * O prefixo deixa os registros legíveis e facilita uma futura estratégia de sync sem
 * acoplar o domínio a APIs nativas.
 */
export function createLocalId(prefix: string): string {
  const safePrefix = prefix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const normalizedPrefix = safePrefix.length > 0 ? safePrefix : 'local';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);

  return `${normalizedPrefix}_${timestamp}_${random}`;
}
