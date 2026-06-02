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

| Camada            | Pode importar                                      | Proibido                                                        |
| ----------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| `domain/`         | `shared/` (tipos puros)                            | React, Expo, RN, `infrastructure/`, `features/`, `app/`, SQLite |
| `infrastructure/` | `domain/`, `shared/`, libs Expo/nativas            | `features/`, `app/`, `components/`                              |
| `features/`       | `domain/`, `infrastructure/` (injeção), `shared/`  | `app/` (rotas)                                                  |
| `components/`     | `shared/`, `theme/`                                | `domain/`, `infrastructure/`, SQLite                            |
| `app/`            | `features/`, `components/`, `providers/`, `theme/` | `domain/` direto, `infrastructure/`, SQLite                     |

## Estrutura física (reconciliada com Expo Router)

```txt
app/                 # camada "app/" do contrato vive na RAIZ (exigência do expo-router)
src/
  components/        # ui/ já existe
  features/          # collections/ decks/ cards/ review/ import-export/ stats/ premium/
  domain/            # entities/ repositories/ services/ schedulers/ importers/ exporters/
  infrastructure/    # database/ filesystem/ tts/ importers/ exporters/ auth/ billing/
  shared/            # types/ utils/ constants/
  providers/ theme/ lib/   # já existem
```

## Pontos de extensão exigidos

`ReviewScheduler` (§18/§32.1), `DeckImporter`/`DeckExporter` (§23/§32), `TtsProvider`
(§14/§32.2), `PremiumGate` (§28/§32.5). Em dúvida local vs remoto → local (§38).
