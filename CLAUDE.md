# CLAUDE.md

Instruções para o Claude Code neste repositório. **Este arquivo é carregado
automaticamente** — ele vincula a regra principal e indexa agentes, regras e contexto.

## ⚠️ Regra principal (OBRIGATÓRIA): Contract-First

[`CONTRATO_README.md`](./CONTRATO_README.md) é a **fonte única da verdade** do produto e da
arquitetura. **Antes de propor ou aplicar qualquer mudança arquitetural, nova feature,
dependência, modelagem de dados, interface ou alteração de fluxo, você DEVE consultar o
`CONTRATO_README.md`** (citando as seções relevantes) e os arquivos de contexto/regras
abaixo. Regra completa: [`.claude/rules/00-contract-first.md`](./.claude/rules/00-contract-first.md).

Princípios inegociáveis:

1. **Não invente funcionalidades** fora do contrato (§38).
2. **Offline-first**: o app funciona sem internet; base local é a fonte primária (§29).
3. **Local = Free, remoto = Premium** (§4/§28). Em dúvida local vs remoto, **priorize local**.
4. **Clean Architecture/DDD**: `app/+components → features → domain ← infrastructure`; o
   domínio é TS puro; SQLite só em repositórios; sem regra de negócio na UI.
5. **Sem IA na V1** (§27) — apenas pontos de extensão.

## O que é o projeto

App mobile de flashcards para aprendizado de idiomas. React Native + Expo (SDK 54) +
TypeScript, offline-first, SQLite local, organização Coleção → Deck → Cards, revisão
espaçada SM-2 (extensível), importação/exportação por conectores, e arquitetura preparada
para Premium/Sync futuros. Stack detalhada: [`.claude/context/tech-stack.md`](./.claude/context/tech-stack.md).

## Comandos de qualidade

```bash
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # eslint
npm run test        # jest (jest-expo)
npm run validate    # typecheck + lint + format:check
```

Não conclua uma tarefa sem rodar typecheck + testes. Não relaxe `strict`/ESLint para passar.

## Regra de Expo Go (não quebrar)

Versões de `react-native`/`reanimated`/`worklets` estão **fixadas** e há `overrides` +
`babel-preset-expo` explícitos para compatibilidade com o Expo Go. Não atualize nem remova
sem validar no Expo Go.

## Contexto (ler conforme a tarefa)

- [`.claude/context/architecture.md`](./.claude/context/architecture.md) — camadas, dependências, estrutura reconciliada.
- [`.claude/context/domain-model.md`](./.claude/context/domain-model.md) — entidades, invariantes, enums.
- [`.claude/context/tech-stack.md`](./.claude/context/tech-stack.md) — libs, versões, convenções.
- [`.claude/context/glossary.md`](./.claude/context/glossary.md) — termos canônicos (use estes nomes).

## Regras

- [`00-contract-first`](./.claude/rules/00-contract-first.md) — **principal**, consultar o contrato.
- [`01-layering`](./.claude/rules/01-layering.md) — camadas e dependências.
- [`02-offline-first`](./.claude/rules/02-offline-first.md) — storage local, SQLite atrás de repositórios.
- [`03-premium-gating`](./.claude/rules/03-premium-gating.md) — Free × Premium, PremiumGate.
- [`04-testing`](./.claude/rules/04-testing.md) — testes obrigatórios e validação.

## Agentes (delegue por especialidade) — `.claude/agents/`

Obrigatórios:

1. [`project-context-architecture`](./.claude/agents/project-context-architecture.md) — arquitetura, camadas, "onde mora o código".
2. [`react-native-expo`](./.claude/agents/react-native-expo.md) — telas, navegação, Expo, performance, Expo Go.
3. [`offline-first-storage`](./.claude/agents/offline-first-storage.md) — SQLite, filesystem, repositórios, query de revisão.
4. [`cards-domain-model`](./.claude/agents/cards-domain-model.md) — entidades, invariantes, enums, reverso.
5. [`spaced-repetition-scheduler`](./.claude/agents/spaced-repetition-scheduler.md) — SM-2 atrás de `ReviewScheduler`.
6. [`import-export-connectors`](./.claude/agents/import-export-connectors.md) — CSV/ZIP/APKG plugáveis.
7. [`testing-quality`](./.claude/agents/testing-quality.md) — testes e validação arquitetural.

Opcionais: 8. [`state-management`](./.claude/agents/state-management.md) — Zustand (UI) vs React Query (dados). 9. [`ui-ux-mobile`](./.claude/agents/ui-ux-mobile.md) — UX de estudo, acessibilidade, microcopy. 10. [`premium-gate-billing`](./.claude/agents/premium-gate-billing.md) — PremiumGate, isolamento Free/Premium.

## Comandos (slash) — `.claude/commands/`

- `/contract-check <mudança>` — checa conformidade com o contrato antes de implementar.
- `/new-feature <feature>` — planeja feature por camadas, delegando aos agentes.
- `/new-card-type <tipo>` — guia tipo de card (sem sair dos 5 do §7–§12).
- `/new-connector <conector>` — guia importer/exporter plugável.
- `/architecture-review [escopo]` — revisa o diff quanto a camadas/offline/premium/contrato.

## Consistência entre IAs

As mesmas regras existem para Codex (`.codex/`, `AGENTS.md`) e Cursor (`.cursor/`). Mantenha
as três fontes alinhadas: ao mudar uma regra/contexto aqui, reflita nas outras. Visão geral
em [`AGENTS_GUIDE.md`](./AGENTS_GUIDE.md).
