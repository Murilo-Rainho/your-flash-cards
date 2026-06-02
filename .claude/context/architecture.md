# Contexto: Arquitetura

> Fonte da verdade: [`CONTRATO_README.md`](../../CONTRATO_README.md) §31 e §38.
> Este arquivo **reconcilia** a estrutura sugerida no contrato com a estrutura real
> do projeto (Expo Router). Em caso de conflito, o contrato vence em **intenção**;
> este arquivo vence em **localização física dos arquivos**.

## Princípios (não negociáveis)

1. **Clean Architecture + DDD.** O domínio é o centro e não conhece ninguém.
2. **Regra de dependência:** o código de fora pode importar o de dentro, nunca o
   contrário. `UI → features → domain ← infrastructure`.
3. **Offline-first.** A base local (SQLite) é a fonte primária de dados.
4. **Inversão de dependência** para tudo que é substituível: scheduler (SM-2),
   importers/exporters, TTS, billing/auth.
5. **V1 simples para o usuário, bem estruturada por dentro** para crescer.

## Camadas

```txt
domain/          ← NÚCLEO. TypeScript puro. Zero imports de React/Expo/UI/infra.
infrastructure/  ← Implementa as interfaces do domínio usando SQLite/FS/Expo.
features/        ← Casos de uso + hooks; orquestra domain + infrastructure.
app/ + components/ ← UI. Só conhece features. Nunca toca em SQLite/infra direto.
shared/          ← Tipos, utils e constantes sem regra de negócio.
```

### O que cada camada PODE e NÃO PODE importar

| Camada            | Pode importar                                         | Proibido importar                                               |
| ----------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| `domain/`         | `shared/` (tipos puros)                               | React, Expo, RN, `infrastructure/`, `features/`, `app/`, SQLite |
| `infrastructure/` | `domain/`, `shared/`, libs nativas/Expo               | `features/`, `app/`, `components/`                              |
| `features/`       | `domain/`, `infrastructure/` (via injeção), `shared/` | `app/` (rotas)                                                  |
| `components/`     | `shared/`, `theme/`                                   | `domain/`, `infrastructure/`, SQLite                            |
| `app/` (rotas)    | `features/`, `components/`, `providers/`, `theme/`    | `domain/` direto, `infrastructure/`, SQLite                     |

> Regra de ouro: **se uma tela precisa de uma regra de negócio, ela chama um hook/caso
> de uso de `features/`, que chama o domínio.** Nunca o contrário, nunca pulando camadas.

## Estrutura física reconciliada

O contrato (§31) sugere `src/app/`. O projeto usa **Expo Router**, que exige a pasta
`app/` na **raiz** do projeto. Portanto:

```txt
app/                       # ← camada "app/" do contrato = rotas Expo Router (file-based)
  _layout.tsx              # providers globais + Stack
  index.tsx                # Home/Dashboard
  (collections)/ ...       # grupos de rota por feature (a criar)
src/
  components/
    ui/                    # componentes base já existentes (Screen, Text, Button, Card)
  features/                # ← do contrato
    collections/ decks/ cards/ review/ import-export/ stats/ premium/
  domain/                  # ← do contrato (TS puro)
    entities/ repositories/ services/ schedulers/ importers/ exporters/
  infrastructure/          # ← do contrato
    database/ filesystem/ tts/ importers/ exporters/ auth/ billing/
  shared/                  # ← do contrato
    types/ utils/ constants/
  providers/               # já existe (React Query + SafeArea)
  theme/                   # já existe (tokens.js = fonte única de cores)
  lib/                     # já existe (queryClient e infra compartilhada de app)
```

Notas de reconciliação:

- A pasta `app/` do contrato **vive na raiz**, não em `src/app/`, por exigência do
  Expo Router. Toda a "camada de apresentação/rotas" mora ali.
- `src/providers`, `src/theme`, `src/lib` já existem e são compatíveis: tratam de
  composição de UI e infra de app (não de domínio).
- `src/components/ui` já contém os componentes base; novos componentes compartilhados
  entram em `src/components/`.

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
implementações por injeção (composição na borda, ex.: providers/contexto/factory).

## Pontos de extensão exigidos pelo contrato

- `ReviewScheduler` (SM-2 hoje; FSRS/custom no futuro) — §18, §32.1.
- `DeckImporter` / `DeckExporter` (CSV/ZIP/APKG hoje; Quizlet/Cloud no futuro) — §23, §32.3/§32.4.
- `TtsProvider` (expo-speech) — §14.2, §32.2.
- `PremiumGate` (Free local vs Premium remoto) — §28, §32.5.

Sempre que algo exigir internet/API/servidor: **tratar como Premium ou deixar como
ponto de extensão**. Em dúvida entre local e remoto: **priorizar local** (§38).
