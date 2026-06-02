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

## Validação arquitetural

Antes de concluir uma mudança:

```bash
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # eslint
npm run test        # jest
npm run validate    # os três (typecheck + lint + format:check)
```

- Falha de tipos/lint **bloqueia** a entrega.
- Não relaxar `strict`, regras de ESLint ou cobertura para "passar".

## Proibições

- ❌ Entregar domínio/scheduler/import-export sem teste.
- ❌ Testes que dependem de rede (offline-first vale também para testes).
- ❌ Marcar tarefa como concluída sem rodar typecheck + testes.

## Checklist

- [ ] Domínio, scheduler e import/export têm testes.
- [ ] `npm run validate` passa.
- [ ] Casos de borda do SM-2 cobertos (lapse, ease mínimo, primeira revisão).
- [ ] APKG: teste de card inválido não derruba a importação inteira.
