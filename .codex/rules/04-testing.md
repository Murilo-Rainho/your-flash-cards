# Regra Codex 04 — Testes & Qualidade

Testes **obrigatórios** para: domínio, scheduler (SM-2) e import/export (§36).

- jest + jest-expo; alias `@/`→`src/`. Lógica pura sem mocks de Expo; infra via fakes que
  respeitam interfaces do domínio.
- SM-2: cobrir cada rating e bordas (1ª revisão, ease mínimo, lapse).
- APKG: card inválido não trava a importação (`skipped` reportado).
- Testes offline e determinísticos.
- `npm run test:coverage` coleta cobertura das áreas críticas configuradas no Jest:
  `src/domain`, `src/features/review/services`, `src/features/import-export/services`,
  `src/infrastructure/importers` e `src/infrastructure/exporters`.
- Gate mínimo: **80%** para statements, branches, functions e lines.

Antes de concluir: `npm run validate && npm run test:coverage`. Não relaxar
`strict`/ESLint/cobertura para passar; não concluir sem rodar.
