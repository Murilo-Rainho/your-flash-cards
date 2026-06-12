# Skill: testing-quality

> Pré-requisito: skill [`project-context`](./project-context.md).

## Objetivo

Garantir cobertura e validação arquitetural das áreas críticas. Base: §36 + setup jest-expo.

## Entradas

- Código de domínio, scheduler e import/export alterado.
- Interfaces do domínio (para fakes/in-memory repos).

## Saídas

- Testes unitários (domínio/scheduler) e de integração (repos via fakes).
- Suíte verde: `npm run validate && npm run test:coverage`.

## Restrições

- Domínio, scheduler e import/export **devem** ter testes.
- Testes não dependem de rede (offline-first também nos testes).
- Não relaxar `strict`/ESLint/cobertura para "passar".
- Não concluir tarefa sem rodar validate + coverage.

## Padrões obrigatórios

- jest + preset jest-expo; alias `@/` → `src/` (já configurado).
- `npm run test:coverage` deve passar com cobertura >=80% nas áreas críticas configuradas
  no Jest (`src/domain`, review services e conectores import/export).
- Lógica pura testada sem mocks de Expo; infra testada contra interfaces do domínio.
- Tabela de casos para SM-2 (rating × estado) e casos de borda (1ª revisão, ease mínimo, lapse).
- APKG: teste de card inválido (`skipped.length >= 1`, sem lançar).

## Anti-patterns (proibido)

- ❌ Entregar domínio/scheduler/import-export sem teste.
- ❌ Testes com rede ou não determinísticos.
- ❌ Comentar/ignorar testes para fechar tarefa.
- ❌ Baixar `strict` ou desligar regras de lint.
- ❌ Baixar threshold/escopo de cobertura para mascarar falta de testes.
