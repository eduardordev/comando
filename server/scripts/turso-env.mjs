export function resolveTursoConfig() {
  const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '').trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() ?? '';

  if (!url || !authToken) return null;
  if (url.startsWith('file:')) return null;

  const isRemote =
    url.startsWith('libsql://') ||
    url.startsWith('https://') ||
    url.startsWith('http://');

  if (!isRemote) return null;

  return { url, authToken };
}
