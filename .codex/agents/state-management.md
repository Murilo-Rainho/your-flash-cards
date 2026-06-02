# Agente Codex: state-management (opcional)

**Regras:** 01. **Stack:** `.codex/context/tech-stack.md`.

- **Papel:** estado da aplicação — Zustand (UI/sessão) vs React Query (dados async do SQLite
  local), sincronização entre telas.
- **Quando usar:** decidir onde um estado mora; modelar a store da sessão de estudo;
  configurar invalidação/cache de queries.
- **Faz:** React Query para dados persistidos (via casos de uso) com invalidação correta;
  Zustand para estado efêmero; estado fino (regra de negócio fica no domínio).
- **Não faz:** ❌ cálculo de scheduling/limite/reverso na store; ❌ SQLite direto na store;
  ❌ duplicar fonte de verdade; ❌ persistir domínio fora do SQLite.
- **Checklist:** dados via React Query, UI via Zustand? sem regra de negócio no estado?
  mutations invalidam queries certas? sem duplicação?
