# Skill: react-native-expo

> Pré-requisito: skill [`project-context`](./project-context.md).

## Objetivo

Implementar a camada de UI (rotas Expo Router + componentes) com NativeWind/tema, navegação
e mídia, sem quebrar a compatibilidade com Expo Go. Base: contrato §2, §33; stack em
`.codex/context/tech-stack.md`.

## Entradas

- Tela/fluxo do §33; componentes compartilhados em `src/components/common`/`forms` (a criar).
- Tokens de tema (`@/theme`, classes NativeWind).
- Casos de uso/hooks de `features/`.

## Saídas

- Rotas em `app/` e componentes em `src/components`, "burros" (sem regra de negócio).
- Navegação configurada (Stack/headers/safe areas), permissões de mídia quando necessárias.

## Restrições

- Telas não contêm regra de negócio nem acesso a SQLite.
- **Cores do tema selecionado:** tokens NativeWind (`bg-primary`, `text-textPrimary`, …) ou
  `useTheme().colors` para inline/props — refletem a paleta do usuário. Nada de cor crua.
- **Textos de UI nos catálogos de idioma:** `src/strings/locales/pt-BR/` e `en-US/` (módulo por
  feature), tipo em `src/strings/types.ts`, consumo via `useStrings()`. Nada hardcoded no JSX.
- Não atualizar `react-native`/`reanimated`/`worklets` nem remover overrides/preset (Expo Go).
- Arquitetura não pode impedir iOS futuro.

## Padrões obrigatórios

- Componentes pequenos e composáveis; variantes via objeto `as const` + classes do tema
  (padrão do `Button` existente).
- Inputs/campos de formulário: `useTheme()` para cores dinâmicas; `useStrings()` para labels,
  placeholders, erros e a11y.
- Listas longas virtualizadas; evitar re-renders.
- Mídia/áudio/TTS atrás de infra/interfaces (`TtsProvider`), não chamados crus na tela.
- Alias `@/*` para imports de `src`.

## Anti-patterns (proibido)

- ❌ Componentes gigantes/monolíticos.
- ❌ Adicionar libs redundantes (preferir Expo nativo / o que já existe).
- ❌ `fetch` para backend em fluxo Free.
- ❌ Lógica de domínio dentro de `onPress`/render.
- ❌ Strings visíveis hardcoded no componente (use catálogos `pt-BR`/`en-US`).
