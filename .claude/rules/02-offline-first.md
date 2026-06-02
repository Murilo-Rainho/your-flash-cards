# Regra 02 — Offline-First & Storage

> Base: `CONTRATO_README.md` §29, §20, §26, §13, §14.

## Princípio

A base local (SQLite) é a **fonte primária** de dados. O app deve **abrir, estudar, criar
cards, revisar, ver estatísticas e importar/exportar localmente** sem qualquer conexão.

## Regras

- ✅ Todo fluxo Free funciona **100% offline**. Nada em `app/`/`features/` pode exigir rede.
- ✅ SQLite acessado **somente** por repositórios na `infrastructure/database`, atrás de
  interfaces do `domain/repositories`.
- ✅ Mídia (imagens, áudios, gravações) no **filesystem local** (`infrastructure/filesystem`),
  com a entidade `Media.uri` apontando para o arquivo local.
- ✅ Consultas de revisão são **paginadas/limitadas**: filtre `nextReviewAt <= now` com
  `ORDER BY next_review_at ASC LIMIT :sessionLimit`. **Nunca** carregue todos os cards
  (§20). Mesmo com 5000 cards, só vencidos entram na sessão.
- ✅ Estatísticas calculadas **localmente** a partir de `ReviewLog`/`ReviewItem` (§22).
- ✅ Backup na V1 = **exportação local manual** (§26). Sem backup automático em nuvem.

## Proibições

- ❌ Dependência obrigatória de backend para qualquer fluxo Free.
- ❌ Acesso a SQLite fora dos repositórios (UI, features, componentes).
- ❌ Carregar a coleção inteira em memória para montar a sessão.
- ❌ Migrações/queries inline na UI; centralize na `infrastructure/database`.

## Sync futuro (apenas preparação)

A modelagem deve **permitir** sync futuro (campos `updatedAt`, ids estáveis), mas sync é
**Premium futuro** (§4.2). Não implemente sync, conflitos ou fila de replicação na V1 —
deixe como ponto de extensão.

## Checklist

- [ ] Funciona com o dispositivo em modo avião?
- [ ] SQLite só aparece na `infrastructure/database`?
- [ ] A sessão de estudo usa `WHERE next_review_at <= now ... LIMIT`?
- [ ] Mídia referenciada por URI local, exportável em ZIP?
- [ ] Nenhum import de cliente HTTP em camadas Free.
