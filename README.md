# Your Flash Cards

App mobile em **Expo (SDK 54) + React Native + TypeScript + Expo Router + NativeWind (Tailwind)**.
As versões estão fixadas para serem compatíveis com o **Expo Go** publicado na loja.

## Começando

```bash
npm install
npm start        # abre o Metro; leia o QR code no Expo Go
npm run android  # abre direto no Android
npm run ios      # abre direto no iOS
npm run web      # abre no navegador
```

## Estrutura

Toda a aplicação vive em `src/` (alias `@/*` → `src/*`). As rotas do Expo Router ficam em
`src/app/`.

```
src/
  app/                 # Rotas (expo-router, file-based) — _layout.tsx + index.tsx
  components/
    common/            # Componentes base compartilhados (a criar)
    forms/             # Componentes de formulário (a criar)
  features/            # Casos de uso + hooks por domínio de UI
    collections/ decks/ cards/ review/ import-export/ stats/ premium/
      components/ screens/ hooks/ services/
  domain/              # Núcleo TypeScript puro (entidades, interfaces, regras)
    entities/ repositories/ services/ schedulers/ importers/ exporters/ premium/
  infrastructure/      # Implementações (SQLite, filesystem, TTS, conectores, billing)
    database/sqlite/   # migrations/ repositories/
    database/remote/   # repositories/ (Premium/sync futuro)
    filesystem/ tts/ importers/ exporters/ premium/
  state/stores/        # Estado global de UI/sessão (Zustand)
  theme/               # colors.ts, spacing.ts, typography.ts, radius.ts, shadows.ts, icons.ts, index.ts
  constants/           # cardTypes, featureFlags, limits, routes, languages
  utils/               # date, ids, file, normalizeText, validation
  config/              # env, app
  tests/               # factories/ mocks/
global.css             # Diretivas do Tailwind
tailwind.config.ts     # Lê as cores de src/theme/colors.ts (fonte única)
```

## Tema (cores)

O tema é **TypeScript puro** em `src/theme/`. A paleta vive em **`src/theme/colors.ts`**
(fonte única de verdade):

- As classes do NativeWind (`bg-primary`, `bg-surface`, `text-textPrimary`,
  `text-textSecondary`, `border-border`, ...) são geradas a partir de `colors.ts` via
  `tailwind.config.ts` — sem duplicação.
- Em contextos que não aceitam `className` (react-navigation, StatusBar, gráficos, estilos
  inline), importe os valores de `@/theme` (`colors`, `spacing`, `radius`, `shadows`, ...).
- **Ícones** passam sempre por `src/theme/icons.ts` (inversão de dependência), para permitir
  trocar a biblioteca de ícones no futuro sem mexer nas telas.

Tema **claro único** na V1 (sem tema escuro). Para re-tematizar, altere `colors.ts`.

### Regra de ouro

Telas e componentes **sempre** usam os tokens semânticos do tema (classes do NativeWind ou
`@/theme`), **nunca** cores cruas (`#fff`, `bg-blue-500`).

## Qualidade

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
npm run validate     # roda os três acima
```
