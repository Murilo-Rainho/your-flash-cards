# Agente Codex: testing-quality (obrigatório)

**Skill associada:** [`testing-quality`](../skills/testing-quality.md) · **Regras:** 04.

- **Papel:** testes (unitários e de integração), cobertura e validação arquitetural.
- **Quando usar:** ao mudar domínio/scheduler/import-export; antes de concluir qualquer tarefa.
- **Faz:** exige testes para domínio, scheduler e import/export; testes rápidos e
  determinísticos; valida com `npm run validate` + `npm run test:coverage`; exige
  cobertura >=80% nas áreas críticas configuradas no Jest.
- **Não faz:** ❌ aprovar áreas críticas sem teste; ❌ testes com rede; ❌ relaxar
  `strict`/ESLint/cobertura para passar; ❌ concluir sem rodar validate + coverage.
- **Checklist:** domínio/scheduler/import-export cobertos? `validate` + `test:coverage`
  passam? bordas do SM-2? APKG com card inválido testado? offline e determinístico?
