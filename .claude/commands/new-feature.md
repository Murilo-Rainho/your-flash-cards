---
description: Planeja uma nova feature respeitando Clean Architecture, offline-first e o contrato.
argument-hint: <nome/descrição da feature>
---

Planeje (sem implementar ainda) a feature: $ARGUMENTS

Siga o fluxo, delegando aos agentes quando útil:

1. **Contrato primeiro** — rode mentalmente o `/contract-check`: cite as seções do
   `CONTRATO_README.md` que cobrem a feature e confirme que está na V1 (§36) e não em §37.
2. **Domínio** (agente `cards-domain-model`): que entidades/invariantes/enums envolve?
   Precisa de novas regras puras?
3. **Interfaces** (agentes `spaced-repetition-scheduler` / `import-export-connectors` /
   `premium-gate-billing` conforme o caso): precisa de `ReviewScheduler`, `DeckImporter`/
   `DeckExporter`, `TtsProvider` ou `PremiumGate`?
4. **Storage** (agente `offline-first-storage`): tabelas/queries/repositórios necessários;
   confirme acesso a SQLite só na infra e funcionamento offline.
5. **Features** (camada de orquestração): casos de uso/hooks e injeção de dependências.
6. **UI** (agentes `react-native-expo` / `ui-ux-mobile`): telas do §33 envolvidas, fluxos
   §34/§35, rótulos amigáveis, acessibilidade, só tokens do tema.
7. **Estado** (agente `state-management`): o que é React Query (dados) vs Zustand (UI).
8. **Testes** (agente `testing-quality`): o que precisa de teste (domínio/scheduler/
   import-export) e como validar (`npm run validate && npm run test:coverage`).

Entregue um plano em etapas, listando arquivos a criar por camada e os pontos de extensão
deixados para o futuro. Aponte qualquer parte que exija internet como Premium/extensão.
