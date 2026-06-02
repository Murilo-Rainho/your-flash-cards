# Skill: spaced-repetition-scheduler

> Pré-requisito: skill [`project-context`](./project-context.md).

## Objetivo

Implementar o SM-2 atrás da interface `ReviewScheduler`, com inversão de dependência para
suportar FSRS/algoritmos futuros. Base: §18, §19, §20, §32.1.

## Entradas

- Estado de revisão do `ReviewItem` (`repetitions`, `intervalDays`, `easeFactor`, `lapses`).
- `Rating` da avaliação (`again`/`hard`/`good`/`easy`).

## Saídas

- Interface no domínio:
  ```ts
  interface ReviewScheduler {
    type: string;
    schedule(input: ReviewScheduleInput): ReviewScheduleResult;
  }
  ```
- `Sm2Scheduler` puro e determinístico devolvendo `{ nextRepetitions, nextIntervalDays,
nextEaseFactor, nextReviewAt, lapses }`.
- Dados para `ReviewLog` (previous/next interval e ease).

## Restrições

- Função pura, sem I/O; não persiste no banco (quem persiste é a feature/repo).
- Não acoplar a React/Expo/SQLite.
- Manter os 4 ratings do §19 (não reduzir a acertei/errei).
- Nenhum cálculo de scheduling fora desta camada.

## Padrões obrigatórios

- Efeitos por rating: `again` ⇒ reset de repetições, intervalo curto, `lapses+1`, ease
  reduzido (respeitando mínimo); `hard/good/easy` ajustam intervalo/ease conforme SM-2.
- Seleção por `schedulerType` (fábrica) para permitir múltiplos algoritmos.

## Anti-patterns (proibido)

- ❌ Calcular intervalo dentro de componente/handler de UI.
- ❌ Persistir/ler banco dentro do scheduler.
- ❌ Hardcode de regras de scheduling em features/telas.
- ❌ Quebrar a interface `ReviewScheduler` ao adicionar novo algoritmo.
