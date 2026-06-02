# Regra Codex 01 — Camadas e Dependências

Direção inviolável: `app/+components → features → domain ← infrastructure`.

- `domain/` é TS puro (sem React/Expo/SQLite/infra).
- `infrastructure/` implementa interfaces do domínio.
- `features/` orquestra e injeta implementações na borda.
- `app/`/`components/` são UI burra.

Proibições: regra de negócio em telas/componentes; SQLite fora dos repositórios; domínio
importando algo de fora; pular camadas; scheduling/limite/reverso/normalização fora do
domínio.

Obrigatório: interfaces no domínio + implementações na infra; injeção de dependências;
componentes pequenos. Detalhe: `.codex/context/architecture.md`.
