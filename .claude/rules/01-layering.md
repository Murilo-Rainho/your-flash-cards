# Regra 01 — Camadas e Dependências (Clean Architecture + DDD)

> Detalhes e diagrama em [`.claude/context/architecture.md`](../context/architecture.md).
> Base: `CONTRATO_README.md` §31.

## Direção de dependência (inviolável)

```txt
app/ + components/  →  features/  →  domain/  ←  infrastructure/
```

- `domain/` é **TypeScript puro**: zero imports de React, React Native, Expo,
  `infrastructure/`, `features/` ou `app/`.
- `infrastructure/` implementa interfaces do `domain/` (repositórios, scheduler,
  importer/exporter, TTS, billing). Pode usar Expo/SQLite/FS.
- `features/` orquestra domínio + infraestrutura (casos de uso, hooks). Recebe
  implementações por **injeção** (composição na borda).
- `app/` (rotas) e `components/` são **UI burra**: consomem `features/`; nunca tocam em
  `domain/` direto, `infrastructure/` ou SQLite.

## Proibições

- ❌ Lógica de negócio dentro de telas (`app/`) ou componentes (`components/`).
- ❌ Acesso direto ao SQLite/banco a partir da UI ou de `features/` (só via repositórios
  da `infrastructure/`, expostos por interfaces do `domain/`).
- ❌ `domain/` importando qualquer coisa de fora do domínio (exceto tipos puros de `constants/`/`utils/`).
- ❌ Pular camadas (ex.: tela importando um repositório concreto).
- ❌ Cálculo de scheduling, geração de reverso, normalização de
  resposta, etc. **fora** do domínio/serviços.

## Padrões obrigatórios

- Interfaces no `domain/` (`repositories/`, `schedulers/`, `importers/`, `exporters/`,
  e contratos de `TtsProvider`/`PremiumGate`). Implementações concretas na
  `infrastructure/`.
- Injeção de dependências na borda (composição em `src/app/` — ex.: `_layout.tsx` — ou
  factory dedicada), nunca instanciando infra dentro do domínio.
- Componentes pequenos e focados; extraia hooks de `features/` quando a tela crescer.

## Checklist de revisão

- [ ] Cada import respeita a tabela de dependências permitidas.
- [ ] Nenhuma regra de negócio vazou para `app/`/`components/`.
- [ ] SQLite só é tocado por repositórios da `infrastructure/`.
- [ ] O que é substituível (scheduler, importer/exporter, TTS, billing) está atrás de interface.
- [ ] `domain/` continua compilando sem React/Expo.
