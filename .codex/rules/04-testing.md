# Regra Codex 04 — Testes & Qualidade

Testes **obrigatórios** para: domínio, scheduler (SM-2) e import/export (§36).

- jest + jest-expo; alias `@/`→`src/`. Lógica pura sem mocks de Expo; infra via fakes que
  respeitam interfaces do domínio.
- SM-2: cobrir cada rating e bordas (1ª revisão, ease mínimo, lapse).
- APKG: card inválido não trava a importação (`skipped` reportado).
- Testes offline e determinísticos.

Antes de concluir: `npm run typecheck && npm run lint && npm run test` (ou `npm run
validate`). Não relaxar `strict`/ESLint/cobertura para passar; não concluir sem rodar.
