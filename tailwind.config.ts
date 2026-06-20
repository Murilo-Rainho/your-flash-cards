import type { Config } from 'tailwindcss';

// Single color source: src/theme/colors.ts (same tokens used via `@/theme`).
// Tailwind 3.4 loads .ts config natively (jiti), so there is NO color duplication.
import { colors } from './src/theme/colors';

// nativewind/preset is CommonJS and its .d.ts is not an ESM module; require is needed.
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
