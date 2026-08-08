import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

declare global {
  var __pgPool: Pool | undefined;
}

/**
 * Reuse a single pool across hot-reloads in dev (Next.js dev server
 * re-evaluates modules on every request) and across server-action
 * invocations in prod. Without this we would exhaust Postgres'
 * `max_connections` within minutes under `next dev`.
 */
const pool =
  globalThis.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
