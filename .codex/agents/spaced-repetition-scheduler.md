# Agente Codex: spaced-repetition-scheduler (obrigatório)

**Skill associada:** [`spaced-repetition-scheduler`](../skills/spaced-repetition-scheduler.md) · **Regras:** 01, 04.

- **Papel:** SM-2 atrás da interface `ReviewScheduler`, com inversão de dependência para
  FSRS/algoritmos futuros.
- **Quando usar:** implementar/ajustar o SM-2; mapear ratings; gerar `ReviewLog`; selecionar
  scheduler por `schedulerType`.
- **Faz:** `ReviewScheduler` no domínio; `Sm2Scheduler` puro e determinístico; efeitos por
  rating em intervalo/ease/repetições/lapses/nextReviewAt.
- **Não faz:** ❌ espalhar scheduling pela UI/features; ❌ acoplar a React/Expo/SQLite; ❌
  persistir no banco dentro do scheduler; ❌ reduzir os 4 ratings.
- **Checklist:** atrás de `ReviewScheduler`? função pura? 4 ratings corretos? `ReviewLog`
  previous/next? testado (bordas)? nada de cálculo fora desta camada?
