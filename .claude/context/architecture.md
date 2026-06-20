# Contexto: Arquitetura

> Fonte da verdade: [`CONTRATO_README.md`](../../local_files/CONTRATO_README.md) §31 e §38.
> Este arquivo descreve a **estrutura física real** do projeto. Em caso de conflito de
> intenção, o contrato vence; este arquivo vence em **localização dos arquivos**.

## Princípios (não negociáveis)

1. **Clean Architecture + DDD.** O domínio é o centro e não conhece ninguém.
2. **Regra de dependência:** o código de fora pode importar o de dentro, nunca o
   contrário. `UI → features → domain ← infrastructure`.
3. **Offline-first.** A base local (SQLite) é a fonte primária de dados.
4. **Inversão de dependência** para tudo que é substituível: scheduler (SM-2),
   importers/exporters, TTS, billing/auth, ícones.
5. **V1 simples para o usuário, bem estruturada por dentro** para crescer.

## Camadas

```txt
domain/          ← NÚCLEO. TypeScript puro. Zero imports de React/Expo/UI/infra.
infrastructure/  ← Implementa as interfaces do domínio usando SQLite/FS/Expo.
features/        ← Casos de uso + hooks; orquestra domain + infrastructure.
app/ + components/ ← UI. Só conhece features. Nunca toca em SQLite/infra direto.
```

Pastas de apoio sem regra de negócio: `theme/`, `strings/`, `constants/`, `utils/`, `config/`,
`state/` (estado global de UI/sessão).

### O que cada camada PODE e NÃO PODE importar

| Camada            | Pode importar                                                                           | Proibido importar                                                         |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `domain/`         | `constants/`, `utils/` (TS puro)                                                        | React, Expo, RN, `infrastructure/`, `features/`, `app/`, `state/`, SQLite |
| `infrastructure/` | `domain/`, `constants/`, `utils/`, `config/`, libs nativas/Expo                         | `features/`, `app/`, `components/`, `state/`                              |
| `features/`       | `domain/`, `infrastructure/` (via injeção), `state/`, `constants/`, `utils/`, `config/` | `app/` (rotas)                                                            |
| `components/`     | `theme/`, `constants/`, `utils/`                                                        | `domain/`, `infrastructure/`, `features/`, SQLite                         |
| `app/` (rotas)    | `features/`, `components/`, `state/`, `theme/`, `constants/`                            | `domain/` direto, `infrastructure/`, SQLite                               |

> Regra de ouro: **se uma tela precisa de uma regra de negócio, ela chama um hook/caso
> de uso de `features/`, que chama o domínio.** Nunca o contrário, nunca pulando camadas.

## Estrutura física

O contrato (§31) sugere `src/app/`, e o projeto segue exatamente isso: o **Expo Router**
suporta a pasta de rotas em `src/app/` (auto-detectada quando não há `app/` na raiz).
Toda a camada de apresentação/rotas mora em `src/app/`.

```txt
src/
  app/                     # ← camada "app/" do contrato = rotas Expo Router (file-based)
    _layout.tsx            # layout raiz (Stack); composição/injeção na borda
    index.tsx              # tela inicial (placeholder na fundação)
  components/              # UI burra compartilhada
    common/                # componentes base (a criar)
    forms/                 # componentes de formulário (a criar)
  features/                # ← do contrato (casos de uso + hooks)
    collections/ decks/ cards/ review/ import-export/ stats/ premium/
      components/ screens/ hooks/ services/
  domain/                  # ← do contrato (TS puro)
    entities/ repositories/ services/ schedulers/ importers/ exporters/ premium/
  infrastructure/          # ← do contrato (implementa as interfaces do domínio)
    database/
      sqlite/              # migrations/ repositories/
      remote/              # repositories/ (Premium/sync futuro — ponto de extensão)
    filesystem/ tts/ importers/ exporters/ premium/
  state/                   # estado global de UI/sessão (Zustand)
    stores/
  theme/                   # colors.ts spacing.ts typography.ts radius.ts shadows.ts icons.ts index.ts
  strings/                 # locales/pt-BR/ locales/en-US/ types.ts — catálogos i18n da UI
  constants/               # cardTypes featureFlags limits routes languages
  utils/                   # date ids file normalizeText validation
  config/                  # env app
  tests/                   # factories/ mocks/
```

Notas:

- A camada `app/` vive em **`src/app/`** (não na raiz). O `tsconfig`/`babel` mapeiam o
  alias **`@/*` → `src/*`**.
- **Não há `shared/`**: tipos/enums puros do domínio ficam em `domain/entities` (ou em
  `constants/` quando forem identificadores estáveis); utilitários puros em `utils/`.
- **Não há `providers/` nem `lib/`**: a composição/injeção de dependências acontece na
  **borda** (`src/app/_layout.tsx` ou uma factory dedicada). Estado global mora em `state/`.
- **Tema**: `src/theme/` é só TypeScript. `colors.ts` é a fonte única de cores e também
  alimenta o NativeWind via `tailwind.config.ts` (sem duplicação). A paleta ativa vem do
  `ThemeProvider` (`useTheme().colors`) e reflete a escolha do usuário. **Nunca** cor crua na UI.
- **Strings (i18n)**: textos visíveis da UI ficam em `src/strings/locales/{pt-BR,en-US}/`
  (módulo por feature), tipados em `src/strings/types.ts` e consumidos via `useStrings()`.
  **Nunca** hardcode labels/placeholders/erros/microcopy no JSX.
- **Ícones**: passe sempre por `src/theme/icons.ts` (inversão de dependência) para permitir
  troca futura de biblioteca de ícones.

## Fluxo de dependência (diagrama)

```txt
        ┌──────────────────────────────┐
        │ app/ (rotas)  +  components/  │  ← UI "burra"
        └───────────────┬──────────────┘
                        │ usa hooks/casos de uso
        ┌───────────────▼──────────────┐
        │           features/          │  ← orquestração
        └───────┬──────────────┬───────┘
                │ usa          │ injeta implementações
        ┌───────▼──────┐  ┌────▼─────────────────────┐
        │   domain/    │◄─┤     infrastructure/       │
        │ (interfaces, │  │ (SQLite, FS, expo-speech, │
        │  entidades)  │  │  importers/exporters)     │
        └──────────────┘  └───────────────────────────┘
```

O domínio define **interfaces** (repositórios, scheduler, importer/exporter, TTS,
premium gate). A infraestrutura as **implementa**. As features recebem as
implementações por injeção (composição na borda, ex.: `src/app/_layout.tsx`).

## Pontos de extensão exigidos pelo contrato

- `ReviewScheduler` (SM-2 hoje; FSRS/custom no futuro) — §18, §32.1.
- `DeckImporter` / `DeckExporter` (CSV/ZIP/APKG hoje; Quizlet/Cloud no futuro) — §23, §32.3/§32.4.
- `TtsProvider` (expo-speech) — §14.2, §32.2.
- `PremiumGate` (Free local vs Premium remoto) — §28, §32.5.

Sempre que algo exigir internet/API/servidor: **tratar como Premium ou deixar como
ponto de extensão**. Em dúvida entre local e remoto: **priorizar local** (§38).
