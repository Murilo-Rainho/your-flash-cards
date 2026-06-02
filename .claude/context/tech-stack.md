# Contexto: Stack Técnica

> Estado real do repositório (ver [`package.json`](../../package.json)). Mantenha este
> arquivo sincronizado quando dependências mudarem.

## Núcleo

| Área           | Ferramenta / versão                             | Observações                                                |
| -------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Runtime        | Expo SDK **~54**                                | Foco Android na V1 (§2); arquitetura não pode impedir iOS  |
| RN / React     | react-native **0.81.5**, react **19.1.0**       | Versões **fixadas** — ver regra de Expo Go abaixo          |
| Linguagem      | TypeScript **~5.9**, `strict: true`             | Sem `any` implícito; tipar bordas                          |
| Navegação      | **expo-router ~6** (file-based)                 | Rotas em `src/app/` (alias `@/app`)                        |
| Estilo         | **NativeWind 4** + Tailwind 3                   | Cores via tokens do tema, nunca cor crua                   |
| Tema           | `src/theme/*.ts` (`colors.ts` = fonte única)    | Classes (`bg-primary`) ou `@/theme`. Ícones via `icons.ts` |
| Estado async   | **@tanstack/react-query 5**                     | Dados derivados/assíncronos (queries de DB)                |
| Estado client  | **zustand 5**                                   | Estado de UI/sessão local                                  |
| Formulários    | **react-hook-form 7** + **zod 4**               | Validação de inputs nas telas                              |
| Storage seguro | **expo-secure-store**                           | Tokens de auth (Premium futuro)                            |
| TTS            | **expo-speech** (a usar atrás de `TtsProvider`) | §14.2                                                      |
| Testes         | **jest + jest-expo**, alias `@/`→`src/`         | ver `package.json#jest`                                    |
| Qualidade      | ESLint + Prettier + Husky + lint-staged         | `npm run validate`                                         |

## Dependências recomendadas a adicionar (quando a camada for construída)

Estas **ainda não estão instaladas**. Adicione-as somente quando implementar a camada
correspondente e **respeitando a compatibilidade com Expo Go** (regra abaixo):

- **`expo-sqlite`** → camada `infrastructure/database` (banco local, §29).
- **`expo-file-system`** → camada `infrastructure/filesystem` (mídia local, ZIP, §13/§24).
- **`expo-av` / `expo-audio`** → gravação/playback de áudio (listening, pronunciation, §10/§12).
- **`expo-image-picker`** → anexar imagens locais (§13).
- Lib de ZIP em JS (ex.: `jszip`/`fflate`) → importer/exporter ZIP e leitura de `.apkg`
  (que é um ZIP contendo um SQLite) (§23/§25). APKG = **melhor esforço**.

> Antes de instalar qualquer dependência nativa, confirme que há versão compatível com
> o SDK Expo em uso e que não força bump de `react-native`/`reanimated`/`worklets`.

## Regra de Expo Go (NÃO QUEBRAR)

O `package.json` fixa versões e usa `overrides` para `react-native`,
`react-native-reanimated` e `react-native-worklets`, e declara `babel-preset-expo`
explicitamente. **Isso é intencional**: garante compatibilidade com o Expo Go publicado
na loja. **Não** atualize essas versões nem remova os `overrides`/preset sem uma razão
explícita e validação no Expo Go.

## Scripts úteis

```bash
npm start            # Metro (expo start -c)
npm run android      # abre no Android
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run test         # jest
npm run validate     # typecheck + lint + format:check
```

## Convenções de código já adotadas

- Alias **`@/*` → `src/*`** (em `tsconfig.json` e `babel.config.js`). Use sempre o alias.
- Componentes compartilhados em `src/components/common` (base) e `src/components/forms`
  (formulários). A criar — ainda não existem na fundação.
- Telas/rotas em `src/app/` consomem `features/` e `components/`; mantêm-se "burras".
- Tema: **somente tokens semânticos** (`bg-primary`, `bg-surface`, `text-textPrimary`,
  `text-textSecondary`, `border-border`, …), **nunca** `#fff`/`bg-blue-500`. Fonte única
  em `src/theme/colors.ts`. Em contextos sem `className` (navigation, StatusBar, charts),
  importe valores de `@/theme`. Ícones sempre via `@/theme` (`icons.ts`).
