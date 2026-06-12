# Regra 04 — Testes & Qualidade

> Base: `CONTRATO_README.md` §36 + setup real (jest-expo).

## Cobertura obrigatória

Testes são **exigidos** para:

- **Domínio** — entidades, invariantes (geração de reverso, integridade
  hierárquica), serviços.
- **Scheduler** — SM-2: `easeFactor`, `intervalDays`, `repetitions`, `lapses`,
  `nextReviewAt` para cada rating (`again/hard/good/easy`); casos de borda.
- **Import/Export** — CSV/ZIP round-trip; APKG melhor esforço (cards inválidos não
  travam a importação; relatório de ignorados).

## Padrões

- Framework: **jest** com preset **jest-expo**; alias `@/` → `src/` já configurado.
- Lógica de domínio/scheduler é TS puro → testes **rápidos e sem mocks de Expo**.
- Para infraestrutura, teste contra a interface do domínio (fakes/in-memory repos).
- Testes de UI focam comportamento, não pixels.
- `npm run test:coverage` coleta cobertura apenas das áreas críticas configuradas no Jest:
  `src/domain`, `src/features/review/services`, `src/features/import-export/services`,
  `src/infrastructure/importers` e `src/infrastructure/exporters`.
- O gate mínimo é **80%** para statements, branches, functions e lines.

## Validação arquitetural

Antes de concluir uma mudança:

```bash
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # eslint
npm run test        # jest
npm run test:coverage # jest + gate >=80% nas áreas críticas
npm run validate    # typecheck + lint + format:check
```

- Falha de tipos/lint **bloqueia** a entrega.
- Não relaxar `strict`, regras de ESLint ou cobertura para "passar".
- Fechamento obrigatório: `npm run validate && npm run test:coverage`.

## Proibições

- ❌ Entregar domínio/scheduler/import-export sem teste.
- ❌ Testes que dependem de rede (offline-first vale também para testes).
- ❌ Marcar tarefa como concluída sem rodar validate + coverage.

## Checklist

- [ ] Domínio, scheduler e import/export têm testes.
- [ ] `npm run validate` passa.
- [ ] `npm run test:coverage` passa com cobertura >=80% nas áreas críticas.
- [ ] Casos de borda do SM-2 cobertos (lapse, ease mínimo, primeira revisão).
- [ ] APKG: teste de card inválido não derruba a importação inteira.
