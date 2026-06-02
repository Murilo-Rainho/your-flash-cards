# Contexto Codex: Stack Técnica

Espelha `.claude/context/tech-stack.md`. Fonte: `package.json`.

## Instalado

- Expo SDK ~54, react-native 0.81.5, react 19.1.0, TypeScript ~5.9 (`strict`).
- expo-router ~6 (rotas em `app/`), NativeWind 4 + Tailwind 3 (tokens em `src/theme/tokens.js`).
- @tanstack/react-query 5 (dados async), zustand 5 (estado UI), react-hook-form 7 + zod 4.
- expo-secure-store, expo-speech (a usar atrás de `TtsProvider`).
- jest + jest-expo (alias `@/`→`src/`), ESLint + Prettier + Husky + lint-staged.

## A adicionar quando a camada for construída (respeitando Expo Go)

- `expo-sqlite` → `infrastructure/database`.
- `expo-file-system` → `infrastructure/filesystem` (mídia, ZIP).
- `expo-av`/`expo-audio` → áudio (listening/pronunciation).
- `expo-image-picker` → imagens.
- lib de ZIP JS (`jszip`/`fflate`) → ZIP e leitura do `.apkg` (SQLite dentro de ZIP).

## Regra de Expo Go (NÃO QUEBRAR)

Versões de `react-native`/`reanimated`/`worklets` fixadas; `overrides` + `babel-preset-expo`
explícitos para compatibilidade com o Expo Go publicado. Não atualizar/remover sem validar.

## Convenções

- Alias `@/*` → `src/*`. Componentes base em `src/components/ui`. Telas consomem `features/`.
- Só tokens semânticos do tema (`bg-background`, `text-content-primary`...); nunca cor crua.

## Scripts

`npm start` · `npm run android` · `npm run lint` · `npm run typecheck` · `npm run test` ·
`npm run validate`.
