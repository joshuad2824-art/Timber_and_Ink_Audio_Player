import "server-only";

import { getDatabase } from "@netlify/database";

/**
 * The database handle.
 *
 * On Netlify the connection string is supplied by the platform and points at
 * the right branch for the current context — production against the main
 * database, every deploy preview against its own isolated copy. Locally,
 * DATABASE_URL points wherever you are testing.
 */
let cached: ReturnType<typeof getDatabase> | null = null;

export function db() {
  if (cached) return cached;

  const override = process.env.DATABASE_URL;
  cached = override ? getDatabase({ connectionString: override }) : getDatabase();
  return cached;
}
