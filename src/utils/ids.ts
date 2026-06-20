export type IdFactory = () => string;

/**
 * Generates local ids stable enough for offline storage.
 *
 * The prefix keeps records readable and eases a future sync strategy without
 * coupling the domain to native APIs.
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
