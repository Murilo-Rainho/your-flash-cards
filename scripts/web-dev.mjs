// Inicia o Expo no navegador com cache limpo.
// Referenciado pelo script `web` do package.json.
import { spawn } from 'node:child_process';

const child = spawn('npx', ['expo', 'start', '--web', '-c'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
