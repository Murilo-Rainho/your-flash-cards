# Skill: offline-first-storage

> Pré-requisito: skill [`project-context`](./project-context.md).

## Objetivo

Persistir dados localmente (SQLite + filesystem) atrás de repositórios, com a base local
como fonte primária. Base: contrato §29, §20, §13, §14, §24.

## Entradas

- Entidades do §30 (ver `.codex/context/domain-model.md`).
- Interfaces de `domain/repositories`.
- Necessidades de consulta (especialmente a sessão de revisão).

## Saídas

- Schema SQLite + migrações + índices (ex.: em `next_review_at`).
- Repositórios concretos em `infrastructure/database` implementando interfaces do domínio.
- Armazenamento de mídia em `infrastructure/filesystem`, referenciado por `Media.uri`.

## Restrições

- SQLite acessado **somente** por repositórios da infra (nunca UI/features/componentes).
- Nenhum fluxo Free pode exigir backend/rede.
- Nunca carregar todos os cards; a sessão usa filtro de vencidos + `LIMIT`.
- Sync não é implementado na V1 (apenas deixar a base preparada com `updatedAt`/ids estáveis).

## Padrões obrigatórios

- Consulta de revisão:
  ```sql
  SELECT * FROM review_items
  WHERE next_review_at <= CURRENT_TIMESTAMP
  ORDER BY next_review_at ASC
  LIMIT :sessionLimit;
  ```
- Mapeadores linha↔entidade; transações para operações compostas.
- Estatísticas calculadas localmente a partir de `ReviewLog`/`ReviewItem`.

## Anti-patterns (proibido)

- ❌ `db.execAsync`/queries em telas ou stores.
- ❌ Carregar a coleção inteira para montar a sessão.
- ❌ Dependência obrigatória de backend em Free.
- ❌ Implementar sync/replicação na V1.
