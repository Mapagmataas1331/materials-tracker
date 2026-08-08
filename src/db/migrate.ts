import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db, pool } from "./index";

async function main() {
  console.log("Applying Drizzle migrations...");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  console.log("Applying post-migration SQL (extensions, trigram indexes)...");
  const sql = readFileSync(path.join(process.cwd(), "src/db/post-migrate.sql"), "utf-8");
  await pool.query(sql);

  console.log("Database is up to date.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
