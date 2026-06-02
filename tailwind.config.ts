import type { Config } from 'tailwindcss';

// Fonte única de cores: src/theme/colors.ts (mesmos tokens usados via `@/theme`).
// Tailwind 3.4 carrega config .ts nativamente (jiti), então NÃO há duplicação de cores.
import { colors } from './src/theme/colors';

// nativewind/preset é CommonJS e seu .d.ts não é um módulo ESM; require é necessário.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nativewindPreset = require('nativewind/preset');

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors,
    },
  },
  plugins: [],
};

export default config;
