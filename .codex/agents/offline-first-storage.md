# Agente Codex: offline-first-storage (obrigatório)

**Skill associada:** [`offline-first-storage`](../skills/offline-first-storage.md) · **Regras:** 02.

- **Papel:** persistência local — SQLite, filesystem, repositórios, migrações, query de
  revisão, preparação para sync futuro.
- **Quando usar:** modelar tabelas; implementar repositórios; escrever a query de cards
  vencidos; armazenar mídia local.
- **Faz:** schema fiel ao §30; repositórios como única porta ao banco; consultas com `LIMIT`;
  mídia no filesystem (`Media.uri`); estatísticas locais.
- **Não faz:** ❌ backend obrigatório em Free; ❌ SQLite fora da infra; ❌ carregar todos os
  cards; ❌ implementar sync na V1.
- **Checklist:** SQLite só em repositórios? query de revisão filtra vencidos + `LIMIT` +
  índice? mídia local exportável? funciona em modo avião?
