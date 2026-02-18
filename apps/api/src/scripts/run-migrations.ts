/** biome-ignore-all lint/performance/useTopLevelRegex: Migration tags are fixed format */
import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { initDatabase } from "@/database/connection";

function generateMigrationHash(filePath: string): string {
  try {
    const content = readFileSync(filePath, "utf-8");
    return createHash("sha256").update(content).digest("hex");
  } catch {
    // Fallback: use file name if content can't be read
    return createHash("sha256").update(filePath).digest("hex");
  }
}

function getMigrationStatus(
  db: Database,
  migrationTag: string
): "executed" | "pending" {
  // Map migration tags to what they create/modify
  const tableChecks: Record<string, string> = {
    "0000_create_users": "users",
    "0001_create_threads": "threads",
    "0002_create_messages": "messages",
    "0003_create_summaries": "summaries",
    "0004_create_memory_items": "memory_items",
    "0005_create_jobs": "jobs",
    "0006_create_sessions": "sessions",
    "0007_add_email_verification": "verification_tokens",
  };

  const columnChecks: Record<string, { table: string; column: string }> = {
    "0005_create_jobs": { table: "jobs", column: "retry_count" },
    "0009_add_migration_audit": { table: "__migrations", column: "name" },
  };

  const indexChecks: Record<string, string> = {
    "0008_add_missing_indexes": "idx_messages_thread_id",
  };

  // Check if table exists
  if (tableChecks[migrationTag]) {
    const tableName = tableChecks[migrationTag];
    const result = db
      .query(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
      .get(tableName);
    if (result) {
      return "executed";
    }
  }

  // Check if column exists
  if (columnChecks[migrationTag]) {
    const { table, column } = columnChecks[migrationTag];
    const result = db
      .query("SELECT COUNT(*) as count FROM pragma_table_info(?) WHERE name=?")
      .get(table, column) as { count: number };
    if (result.count > 0) {
      return "executed";
    }
  }

  // Check if index exists
  if (indexChecks[migrationTag]) {
    const indexName = indexChecks[migrationTag];
    const result = db
      .query(`SELECT name FROM sqlite_master WHERE type='index' AND name=?`)
      .get(indexName);
    if (result) {
      return "executed";
    }
  }

  return "pending";
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Migration journal sync is inherently complex due to multiple checks and operations
function syncMigrationJournal() {
  const journalPath = resolve("./drizzle/meta/_journal.json");
  const metaDir = resolve("./drizzle/meta");

  logger.info("📝 Syncing migration journal...");
  try {
    // Create meta directory if it doesn't exist
    mkdirSync(metaDir, { recursive: true });

    // Read all SQL migration files
    const drizzleDir = resolve("./drizzle");
    const sqlFiles = readdirSync(drizzleDir)
      .filter((file) => file.endsWith(".sql"))
      .map((file) => file.replace(".sql", ""))
      .sort();

    if (sqlFiles.length === 0) {
      logger.warn("⚠️  No migration files found in drizzle/");
      return;
    }

    // Read existing journal or create new one
    let journal = {
      version: "7",
      dialect: "sqlite",
      entries: [] as Array<{
        idx: number;
        version: string;
        when: number;
        tag: string;
        hash: string;
        breakpoints: boolean;
      }>,
    };

    const journalExists = existsSync(journalPath);
    if (journalExists) {
      try {
        const content = readFileSync(journalPath, "utf-8");
        journal = JSON.parse(content);
      } catch (error) {
        logger.warn(
          `⚠️  Could not read journal: ${(error as Error).message}, creating new one`
        );
      }
    }

    const existingTags = new Set(journal.entries.map((e) => e.tag));

    // Connect to DB to check migration status
    const dbPath = env.DATABASE_URL.replace(/^file:\/+/, "");
    let db: Database | null = null;

    if (existsSync(dbPath)) {
      try {
        db = new Database(dbPath);
      } catch (error) {
        logger.warn(`⚠️  Could not read database: ${(error as Error).message}`);
      }
    }

    // Add new migrations that are not in the journal
    for (const tag of sqlFiles) {
      if (!existingTags.has(tag)) {
        const idx = journal.entries.length;
        const filePath = resolve("./drizzle", `${tag}.sql`);
        const hash = generateMigrationHash(filePath);

        // Check if migration was already executed in the DB
        let timestamp = Date.now() + idx; // Default: pending (recent timestamp)
        if (db) {
          const status = getMigrationStatus(db, tag);
          if (status === "executed") {
            timestamp = 0; // Mark as executed in the past
            logger.info(`  ✓ Migration already executed: ${tag}`);
          } else {
            logger.info(`  ➕ Added migration (pending): ${tag}`);
          }
        } else {
          logger.info(`  ➕ Added migration (pending): ${tag}`);
        }

        journal.entries.push({
          idx,
          version: "6",
          when: timestamp,
          tag,
          hash,
          breakpoints: true,
        });
      }
    }

    // Remove migrations that are no longer in SQL files
    const sqlFilesSet = new Set(sqlFiles);
    const entriesToRemove = journal.entries.filter(
      (e) => !sqlFilesSet.has(e.tag)
    );

    if (entriesToRemove.length > 0) {
      logger.info(
        `  ➖ Removing ${entriesToRemove.length} migration(s) not found in files`
      );
      journal.entries = journal.entries.filter((e) => sqlFilesSet.has(e.tag));

      // Reindex entries
      journal.entries = journal.entries.map((e, index) => ({
        ...e,
        idx: index,
      }));
    }

    // Close DB connection
    if (db) {
      db.close();
    }

    // Write journal file
    writeFileSync(journalPath, JSON.stringify(journal, null, 2));
    logger.info(
      `✅ Migration journal synced with ${journal.entries.length} migration(s)`
    );
  } catch (error) {
    logger.error(`⚠️ Could not sync journal: ${(error as Error).message}`);
    throw error;
  }
}

async function runMigrations() {
  try {
    logger.info("🔄 Starting database migrations...");

    // Sync journal with current SQL files
    syncMigrationJournal();

    await initDatabase();
    logger.info("✅ Database migrations completed successfully");

    // Log migrations to audit table
    try {
      const journalPath = resolve("./drizzle/meta/_journal.json");
      const content = readFileSync(journalPath, "utf-8");
      const journal = JSON.parse(content);

      // Import database connection
      const { sqlite } = await import("@/database/connection");

      for (const entry of journal.entries) {
        const hash =
          entry.hash ||
          generateMigrationHash(resolve("./drizzle", `${entry.tag}.sql`));

        // Update the migration name in __migrations table
        sqlite
          .prepare("UPDATE __migrations SET name = ? WHERE hash = ?")
          .run(entry.tag, hash);
      }

      logger.info("✅ Migration names synced");
    } catch (auditError) {
      logger.warn(
        `⚠️  Could not log to audit table: ${(auditError as Error).message}`
      );
      // Don't fail the migration process if audit logging fails
    }
  } catch (error) {
    logger.error(`❌ Database migrations failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

await runMigrations();
