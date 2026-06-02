# Regra Codex 02 — Offline-First & Storage

Base local (SQLite) é a fonte primária. O app abre, estuda, cria, revisa, vê estatísticas
e importa/exporta localmente **sem internet** (§29).

- SQLite só em repositórios de `infrastructure/database`.
- Mídia no filesystem local (`Media.uri`), exportável em ZIP (§24).
- Sessão de revisão: `WHERE next_review_at <= CURRENT_TIMESTAMP ORDER BY next_review_at ASC
LIMIT :sessionLimit` — nunca carregar todos os cards (§20).
- Estatísticas calculadas localmente (§22). Backup V1 = exportação local manual (§26).

Proibições: backend obrigatório em Free; SQLite na UI; carregar a coleção inteira; sync na
V1 (apenas deixar `updatedAt`/ids estáveis para o futuro).
