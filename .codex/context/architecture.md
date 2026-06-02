# Contexto Codex: Arquitetura

Base: `CONTRATO_README.md` §31. Espelha `.claude/context/architecture.md`.

## Regra de dependência (inviolável)

```txt
app/ + components/  →  features/  →  domain/  ←  infrastructure/
```

- `domain/` = TypeScript **puro** (sem React/Expo/RN/infra/UI).
- `infrastructure/` implementa interfaces do domínio (SQLite, FS, expo-speech, conectores).
- `features/` orquestra (casos de uso/hooks) e injeta implementações na borda.
- `app/` (rotas) + `components/` = UI burra; nunca tocam SQLite/infra direto.

## Imports permitidos × proibidos

| Camada            | Pode importar                                                                       | Proibido                                                                  |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `domain/`         | `constants/`, `utils/` (TS puro)                                                    | React, Expo, RN, `infrastructure/`, `features/`, `app/`, `state/`, SQLite |
| `infrastructure/` | `domain/`, `constants/`, `utils/`, `config/`, libs Expo/nativas                     | `features/`, `app/`, `components/`, `state/`                              |
| `features/`       | `domain/`, `infrastructure/` (injeção), `state/`, `constants/`, `utils/`, `config/` | `app/` (rotas)                                                            |
| `components/`     | `theme/`, `constants/`, `utils/`                                                    | `domain/`, `infrastructure/`, `features/`, SQLite                         |
| `app/` (rotas)    | `features/`, `components/`, `state/`, `theme/`, `constants/`                        | `domain/` direto, `infrastructure/`, SQLite                               |

## Estrutura física (rotas em `src/app/`)

```txt
src/
  app/               # camada "app/" do contrato = rotas expo-router (file-based). _layout + index
  components/        # UI burra: common/ forms/ (a criar)
  features/          # collections/ decks/ cards/ review/ import-export/ stats/ premium/ (components/ screens/ hooks/ services/)
  domain/            # entities/ repositories/ services/ schedulers/ importers/ exporters/ premium/  (TS puro)
  infrastructure/    # database/(sqlite/{migrations,repositories}, remote/repositories) filesystem/ tts/ importers/ exporters/ premium/
  state/             # stores/ (Zustand)
  theme/             # colors.ts spacing.ts typography.ts radius.ts shadows.ts icons.ts index.ts
  constants/         # cardTypes featureFlags limits routes languages
  utils/             # date ids file normalizeText validation
  config/            # env app
  tests/             # factories/ mocks/
```

- Sem `shared/`: tipos/enums puros em `domain/entities` ou `constants/`; utils puros em `utils/`.
- Sem `providers/`/`lib/`: composição/injeção na borda (`src/app/_layout.tsx`). Estado em `state/`.
- Tema só TS; `colors.ts` é fonte única e alimenta o NativeWind via `tailwind.config.ts`. Tema claro único.
- Ícones sempre via `theme/icons.ts` (inversão de dependência).

## Pontos de extensão exigidos

`ReviewScheduler` (§18/§32.1), `DeckImporter`/`DeckExporter` (§23/§32), `TtsProvider`
(§14/§32.2), `PremiumGate` (§28/§32.5). Em dúvida local vs remoto → local (§38).
