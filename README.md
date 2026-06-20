# Your Flash Cards

Mobile flashcard app for language learning. Built with **Expo SDK 54**, **React Native**,
**TypeScript**, **Expo Router**, and **NativeWind (Tailwind)**. Versions are pinned for
compatibility with the **Expo Go** app from the App Store / Play Store.

The app is **offline-first**: collections, decks, cards, spaced-repetition review, and local
import/export work without an internet connection. Data is stored in on-device SQLite.

## Prerequisites

| Tool                             | Version / notes                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**                      | 20 LTS recommended (18+ should work with Expo SDK 54)                                                                                                             |
| **npm**                          | Comes with Node (this repo uses npm, not yarn/pnpm)                                                                                                               |
| **Git**                          | To clone the repository                                                                                                                                           |
| **Expo Go** (phone)              | Latest version from [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| **Android Studio** (optional)    | Only if you want an Android emulator instead of a physical device                                                                                                 |
| **Xcode** (optional, macOS only) | Only if you want the iOS Simulator                                                                                                                                |

## Quick start

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd your-flash-cards
npm install
```

### 2. Expo account (when you need it)

For everyday local development with **Expo Go on the same Wi‑Fi network**, you usually **do
not** need to log in. Metro serves the JavaScript bundle and Expo Go loads it from your
machine.

Create a free account and log in when:

- The CLI asks you to authenticate (some tunnel / publish flows).
- You use **EAS Build** (`npm run android:preview`, etc.).
- You want **tunnel mode** and Expo prompts for credentials.

```bash
# Create an account at https://expo.dev/signup if you don't have one
npx expo login
# Verify
npx expo whoami
```

To log out later: `npx expo logout`.

### 3. Start the dev server

```bash
npm start
```

This runs `expo start -c` (Metro with cache cleared). The terminal shows a QR code and
shortcuts:

| Key | Action                                      |
| --- | ------------------------------------------- |
| `a` | Open on Android emulator / connected device |
| `i` | Open on iOS Simulator (macOS + Xcode only)  |
| `w` | Open in the web browser                     |
| `r` | Reload the app                              |
| `m` | Toggle the dev menu                         |

**Offline dev** (no Expo account / no network checks):

```bash
npm run dev
```

### 4. Run on a physical device (recommended)

1. Install **Expo Go** on your phone.
2. Connect the phone and your computer to the **same Wi‑Fi** network.
3. Run `npm start`.
4. **Android:** open Expo Go → **Scan QR code** → scan the terminal QR code.
5. **iOS:** open the **Camera** app → scan the QR code → tap the Expo banner (or scan from
   inside Expo Go).

If the device cannot reach your computer (corporate Wi‑Fi, VPN, etc.), try tunnel mode:

```bash
npx expo start --tunnel
```

Tunnel may require an Expo account and is slower than LAN; use it only when LAN fails.

### 5. Run on emulators

**Android** (Android Studio with a virtual device configured):

```bash
npm run android
```

**iOS Simulator** (macOS only, Xcode installed):

```bash
npm run ios
```

**Web** (limited; some native features like microphone / SQLite behave differently):

```bash
npm run web
```

## Project structure

All application code lives under `src/` (alias `@/*` → `src/*`). Expo Router routes are in
`src/app/`.

```
src/
  app/                 # Routes (expo-router, file-based)
  components/          # Shared UI (common/, forms/, review/)
  features/            # Use cases + hooks per UI domain
    collections/ decks/ cards/ review/ import-export/ stats/ premium/
  domain/              # Pure TypeScript core (entities, interfaces, rules)
  infrastructure/      # SQLite, filesystem, TTS, importers/exporters
  state/stores/        # Zustand UI/session state
  theme/               # Design tokens (colors, spacing, typography, icons)
  constants/ utils/ config/
  tests/               # Factories and mocks
global.css             # Tailwind directives
tailwind.config.ts     # Reads colors from src/theme/colors.ts
```

## Theming

The theme is plain TypeScript in `src/theme/`. The palette lives in **`src/theme/colors.ts`**
(single source of truth):

- NativeWind classes (`bg-primary`, `text-textPrimary`, …) are generated from `colors.ts` via
  `tailwind.config.ts`.
- For APIs that don't accept `className` (navigation, StatusBar, inline styles), import tokens
  from `@/theme`.
- Icons go through `src/theme/icons.ts` so the icon library can be swapped without touching
  screens.

V1 ships with a **light theme only**. Screens must use semantic tokens, never raw hex colors.

## Quality checks

```bash
npm run typecheck      # tsc --noEmit (strict)
npm run lint           # eslint
npm run format         # prettier --write
npm run format:check   # prettier --check
npm run validate       # typecheck + lint + format:check
npm run test           # jest (jest-expo)
npm run test:coverage  # jest with coverage thresholds on critical areas
```

Before opening a PR, run:

```bash
npm run validate && npm run test:coverage
```

## Troubleshooting

| Problem                               | Things to try                                                               |
| ------------------------------------- | --------------------------------------------------------------------------- |
| QR code won't connect                 | Same Wi‑Fi; disable VPN; try `npx expo start --tunnel`                      |
| "Unable to resolve module" after pull | `npm install` then `npm start` (cache is cleared automatically)             |
| Expo Go version mismatch              | Update Expo Go from the store; this project targets **SDK 54**              |
| Metro port in use                     | Kill the other process or run `npx expo start --port 8082`                  |
| Android emulator not found            | Open Android Studio → Device Manager → start an AVD, then `npm run android` |

## License

See repository settings for license information.
