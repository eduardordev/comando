import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTursoConfig } from '../server/scripts/turso-env.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

if (!resolveTursoConfig()) {
  console.log('Turso no configurado en build; omitiendo migraciones remotas.');
  process.exit(0);
}

console.log('Aplicando migraciones en Turso...');
const result = spawnSync('node', ['scripts/migrate-turso.mjs'], {
  cwd: join(root, 'server'),
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
