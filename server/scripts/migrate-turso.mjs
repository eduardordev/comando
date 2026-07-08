import { createClient } from '@libsql/client';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTursoConfig } from './turso-env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = resolveTursoConfig();

if (!config) {
  console.error('Faltan credenciales de Turso (TURSO_DATABASE_URL o DATABASE_URL + TURSO_AUTH_TOKEN)');
  process.exit(1);
}

const { url, authToken } = config;

const migrationsDir = resolve(__dirname, '../prisma/migrations');
const INIT_MIGRATION = '20260708000329_init';

function getMigrationIds() {
  return readdirSync(migrationsDir)
    .filter((name) => existsSync(join(migrationsDir, name, 'migration.sql')))
    .sort();
}

function parseStatements(sql) {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function tableExists(db, name) {
  const result = await db.execute({
    sql: "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [name],
  });
  return result.rows.length > 0;
}

async function ensureMigrationsTable(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function isMigrationApplied(db, id) {
  const result = await db.execute({
    sql: 'SELECT 1 FROM "_prisma_migrations" WHERE id = ?',
    args: [id],
  });
  return result.rows.length > 0;
}

async function markMigrationApplied(db, id) {
  await db.execute({
    sql: 'INSERT INTO "_prisma_migrations" (id) VALUES (?)',
    args: [id],
  });
}

async function bootstrapExistingDb(db) {
  await ensureMigrationsTable(db);

  const hasTasks = await tableExists(db, 'tasks');
  const initApplied = await isMigrationApplied(db, INIT_MIGRATION);

  if (hasTasks && !initApplied) {
    await markMigrationApplied(db, INIT_MIGRATION);
    console.log('Base existente detectada: migración init marcada como aplicada.');
  }
}

async function applyMigration(db, id) {
  const sqlPath = join(migrationsDir, id, 'migration.sql');
  const statements = parseStatements(readFileSync(sqlPath, 'utf-8'));

  for (const statement of statements) {
    const preview = statement.split('\n').find((line) => line.trim())?.trim() ?? statement;
    console.log(`[${id}] ${preview} ...`);
    await db.execute(statement);
  }

  await markMigrationApplied(db, id);
  console.log(`Migración ${id} aplicada.`);
}

async function main() {
  const db = createClient({ url, authToken });

  try {
    await bootstrapExistingDb(db);

    for (const id of getMigrationIds()) {
      if (await isMigrationApplied(db, id)) {
        console.log(`Omitiendo ${id} (ya aplicada)`);
        continue;
      }
      await applyMigration(db, id);
    }

    console.log('Todas las migraciones están al día.');
  } finally {
    db.close();
  }
}

main().catch((err) => {
  console.error('Error:', err.message ?? err);
  process.exit(1);
});
