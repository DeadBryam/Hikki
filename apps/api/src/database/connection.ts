/** biome-ignore-all lint/performance/noNamespaceImport: Schema import */

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import * as schema from "./schema";

const isTest =
  env.NODE_ENV === "test" || process.argv.some((arg) => arg.includes("test"));
const dbName = isTest ? ":memory:" : env.DATABASE_URL;

export const sqlite = new Database(dbName);

export const db = drizzle(sqlite, { schema });

sqlite.run("PRAGMA foreign_keys = ON;");

sqlite.run("PRAGMA journal_mode = WAL;");
sqlite.run("PRAGMA synchronous = NORMAL;");
sqlite.run("PRAGMA cache_size = -64000;");
sqlite.run("PRAGMA temp_store = MEMORY;");
sqlite.run("PRAGMA mmap_size = 268435456;");

// biome-ignore lint/suspicious/useAwait: Migrations should run synchronously at startup
export async function initDatabase() {
  try {
    migrate(db, {
      migrationsFolder: "./drizzle",
      migrationsTable: "__migrations",
    });
    logger.info("✅ Migrations completed successfully");
  } catch (error) {
    logger.error(`❌ Migrations failed: ${(error as Error).message}`);
    throw error;
  }
}
