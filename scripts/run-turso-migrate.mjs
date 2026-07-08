import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.log('TURSO_* no configurado en build; omitiendo migraciones remotas.');
  process.exit(0);
}

console.log('Aplicando migraciones en Turso...');
const result = spawnSync('node', ['scripts/migrate-turso.mjs'], {
  cwd: join(root, 'server'),
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
