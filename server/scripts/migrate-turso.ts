import { createClient } from '@libsql/client';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

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
  console.error('Genera uno nuevo: turso db tokens create <nombre-db>');
  process.exit(1);
}

const migrationsDir = resolve(__dirname, '../prisma/migrations');
const INIT_MIGRATION = '20260708000329_init';

function getMigrationIds(): string[] {
  return readdirSync(migrationsDir)
    .filter((name) => existsSync(join(migrationsDir, name, 'migration.sql')))
    .sort();
}

function parseStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function tableExists(db: ReturnType<typeof createClient>, name: string): Promise<boolean> {
  const result = await db.execute({
    sql: "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [name],
  });
  return result.rows.length > 0;
}

async function ensureMigrationsTable(db: ReturnType<typeof createClient>) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function isMigrationApplied(db: ReturnType<typeof createClient>, id: string): Promise<boolean> {
  const result = await db.execute({
    sql: 'SELECT 1 FROM "_prisma_migrations" WHERE id = ?',
    args: [id],
  });
  return result.rows.length > 0;
}

async function markMigrationApplied(db: ReturnType<typeof createClient>, id: string) {
  await db.execute({
    sql: 'INSERT INTO "_prisma_migrations" (id) VALUES (?)',
    args: [id],
  });
}

async function bootstrapExistingDb(db: ReturnType<typeof createClient>) {
  await ensureMigrationsTable(db);

  const hasTasks = await tableExists(db, 'tasks');
  const initApplied = await isMigrationApplied(db, INIT_MIGRATION);

  if (hasTasks && !initApplied) {
    await markMigrationApplied(db, INIT_MIGRATION);
    console.log('Base existente detectada: migración init marcada como aplicada.');
  }
}

async function applyMigration(db: ReturnType<typeof createClient>, id: string) {
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
