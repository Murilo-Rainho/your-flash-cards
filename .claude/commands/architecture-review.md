---
description: Revisa o diff/arquivos atuais quanto a camadas, offline-first, premium gating e contrato.
argument-hint: <opcional: caminho ou descrição do escopo>
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep, Glob
---

Faça uma revisão arquitetural do trabalho atual. Escopo: $ARGUMENTS (se vazio, use o diff
não commitado).

Contexto do diff:

- Status: !`git status --short`
- Diff: !`git diff --stat`

Avalie contra `CONTRATO_README.md` e `.claude/rules/`:

1. **Camadas** (`project-context-architecture`): imports respeitam
   `app/+components → features → domain ← infrastructure`? Há regra de negócio em telas/
   componentes? SQLite fora de repositórios?
2. **Offline-first** (`offline-first-storage`): algum fluxo Free exige rede? A query de
   revisão usa `WHERE next_review_at <= now ... LIMIT`?
3. **Domínio** (`cards-domain-model`): entidades fiéis ao §30? Reverso é variant derivada/`isGenerated`?
4. **Scheduler** (`spaced-repetition-scheduler`): cálculo só atrás de `ReviewScheduler`?
5. **Import/Export** (`import-export-connectors`): atrás de interface? APKG é melhor esforço?
6. **Premium** (`premium-gate-billing`): features de rede atrás de `PremiumGate`? Free intacto?
7. **Qualidade** (`testing-quality`): áreas críticas testadas? `npm run validate &&
npm run test:coverage` passariam?

Saída: lista de achados priorizada (❌ bloqueante / ⚠️ atenção / ✅ ok), cada um com
arquivo:linha e a seção do contrato/regra violada. Não altere código — apenas relate.
