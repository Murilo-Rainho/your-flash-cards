# Skill: project-context (PRINCIPAL — OBRIGATÓRIA)

> Esta skill é o **pré-requisito de toda implementação**. Codex deve executá-la antes de
> escrever ou alterar qualquer código.

## Objetivo

Garantir que toda mudança parta do `CONTRATO_README.md` (fonte única da verdade) e respeite
a arquitetura, o offline-first e a separação Free/Premium do projeto.

## Entradas

- A tarefa/feature solicitada.
- [`CONTRATO_README.md`](../../CONTRATO_README.md) (raiz do projeto).
- `.codex/context/` (architecture, domain-model, tech-stack, glossary).
- `.codex/rules/` (contract-first, layering, offline-first, premium-gating, testing).

## Saídas

- Lista das **seções do contrato** que embasam a tarefa (ex.: §18, §29, §30).
- A(s) **camada(s)** envolvidas e os arquivos a criar/alterar.
- As **interfaces** necessárias (`ReviewScheduler`, `DeckImporter`/`DeckExporter`,
  `TtsProvider`, `PremiumGate`) quando aplicável.
- Confirmação de que o fluxo é **offline/Free** ou, se remoto, marcado como **Premium/
  ponto de extensão**.

## Restrições

- Não iniciar implementação sem citar o contrato.
- Não inventar funcionalidades fora do contrato (§38).
- Não introduzir dependência obrigatória de internet em fluxos Free (§29).
- Em dúvida local vs remoto: **priorizar local** (§38). Em ambiguidade, apresentar opções e
  recomendar a mais simples/local — não decidir sozinho por algo remoto/complexo.

## Padrões obrigatórios

- Clean Architecture/DDD: `app/+components → features → domain ← infrastructure`; domínio TS puro.
- Inversão de dependência para tudo substituível (scheduler, importers/exporters, TTS, billing).
- SQLite só em repositórios da `infrastructure/database`.
- TS `strict`; só tokens de tema; testes para domínio/scheduler/import-export.

## Anti-patterns (proibido)

- ❌ Codar antes de ler o contrato.
- ❌ Regra de negócio em telas/componentes; SQLite direto na UI.
- ❌ Features de rede sem `PremiumGate`; quebrar o caminho Free.
- ❌ IA na V1 (§27); subdecks; export `.apkg` (§37).
- ❌ Atualizar versões fixadas / remover overrides do Expo Go.

## Procedimento

1. Ler o contrato e mapear seções relevantes.
2. Carregar a skill específica da área (ex.: `spaced-repetition-scheduler`).
3. Planejar por camada; identificar interfaces e pontos de extensão.
4. Implementar; rodar `npm run validate && npm run test:coverage`.
5. Garantir que o app continua funcionando offline e que o Free não quebrou.
