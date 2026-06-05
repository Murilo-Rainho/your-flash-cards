import type { Tag } from '@/domain/entities/Tag';

export type TagRepository = {
  /**
   * Cria a tag se ainda não existir (chave: `normalizedName`) e retorna sempre a linha
   * canônica armazenada — a existente quando já houver uma com a mesma chave.
   */
  createIfAbsent(tag: Tag): Promise<Tag>;
  listAll(): Promise<Tag[]>;
};
