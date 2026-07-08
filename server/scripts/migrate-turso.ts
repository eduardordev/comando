import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  console.error('Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN');
  process.exit(1);
}

if (!url.startsWith('libsql://')) {
  console.error('TURSO_DATABASE_URL debe empezar con libsql://');
  process.exit(1);
}

if (!authToken.startsWith('eyJ')) {
  console.error('TURSO_AUTH_TOKEN inválido: debe ser el JWT completo que empieza con eyJ');
  console.error('Genera uno nuevo: ~/.turso/turso db tokens create comando-del-dia');
  process.exit(1);
}

const migrationPath = resolve(
  __dirname,
  '../prisma/migrations/20260708000329_init/migration.sql',
);

const sql = readFileSync(migrationPath, 'utf-8');
const statements = sql
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  const db = createClient({ url, authToken });

  for (const statement of statements) {
    console.log('Ejecutando:', statement.split('\n')[0], '...');
    await db.execute(statement);
  }

  console.log('Migración aplicada en Turso.');
  db.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
