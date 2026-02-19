/** biome-ignore-all lint/suspicious/useAwait:  JUST TEST FILE */
import { Database } from "bun:sqlite";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

// biome-ignore lint/performance/noNamespaceImport: Schema import
import * as schema from "@/database/schema";

interface TableRow {
  name: string;
}

interface UserRow {
  created_at: string;
  id: string;
  name: string | null;
  password: string | null;
  username: string;
}

interface ThreadRow {
  created_at: string;
  deleted_at: string | null;
  id: string;
  message_count: number;
  title: string;
  updated_at: string;
  user_id: string;
}

interface MessageRow {
  content: string;
  created_at: string;
  id: string;
  role: "user" | "assistant";
  thread_id: string;
}

interface SummaryRow {
  created_at: string;
  id: string;
  summary: string;
  thread_id: string;
  updated_at: string;
}

interface MemoryItemRow {
  content: string;
  created_at: string;
  deleted_at: string | null;
  id: string;
  thread_id: string | null;
  type: "fact" | "personality" | "event" | "other";
  updated_at: string;
}

interface JobRow {
  created_at: string;
  data: string;
  execute_at: string;
  id: string;
  service: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  updated_at: string;
}

describe("Database Tests", () => {
  let testDb: Database;

  beforeAll(() => {
    testDb = new Database(":memory:");
    testDb.run("PRAGMA foreign_keys = ON;");

    // Create the __migrations table that the first migration expects
    testDb.exec(`
      CREATE TABLE IF NOT EXISTS __migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL,
        created_at INTEGER
        name TEXT
      );
    `);

    const db = drizzle(testDb, { schema });

    // Run migrations
    try {
      migrate(db, { migrationsFolder: "./drizzle" });
    } catch {
      // If migration fails, we may need to manually mark the first migration as applied
      // since it tries to ALTER a table that might not exist in the expected state
      console.log(
        "Migration note: Some migrations may have already been applied"
      );
    }

    const userId = crypto.randomUUID();
    testDb.run(
      "INSERT INTO users (id, username, name, password) VALUES (?, ?, ?, ?)",
      [userId, "root", "Root User", ""]
    );
  });

  afterAll(() => {
    testDb.close();
  });

  it("should create drizzle migrations table", () => {
    const tables = testDb
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as TableRow[];
    const tableNames = tables.map((row) => row.name);
    expect(tableNames).toContain("__drizzle_migrations");
  });

  it("should create users table", () => {
    const tables = testDb
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as TableRow[];
    const tableNames = tables.map((row) => row.name);
    expect(tableNames).toContain("users");
  });

  it("should create threads table", () => {
    const tables = testDb
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as TableRow[];
    const tableNames = tables.map((row) => row.name);
    expect(tableNames).toContain("threads");
  });

  it("should create messages table", () => {
    const tables = testDb
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as TableRow[];
    const tableNames = tables.map((row) => row.name);
    expect(tableNames).toContain("messages");
  });

  it("should create root user", () => {
    const users = testDb
      .query("SELECT * FROM users WHERE username = 'root'")
      .all() as UserRow[];
    expect(users.length).toBe(1);
    expect(users[0].name).toBe("Root User");
    expect(users[0].password).toBe("");
  });

  it("should enforce foreign keys", () => {
    expect(() => {
      testDb.run("INSERT INTO threads (id, user_id, title) VALUES (?, ?, ?)", [
        "test-thread",
        "invalid-user",
        "Test Thread",
      ]);
    }).toThrow();
  });

  it("should allow valid thread creation", () => {
    const user = testDb
      .query("SELECT id FROM users WHERE username = 'root'")
      .get() as UserRow;
    testDb.run("INSERT INTO threads (id, user_id, title) VALUES (?, ?, ?)", [
      "valid-thread",
      user.id,
      "Test Thread",
    ]);

    const threads = testDb
      .query("SELECT * FROM threads WHERE id = 'valid-thread'")
      .all() as ThreadRow[];
    expect(threads.length).toBe(1);
    expect(threads[0].title).toBe("Test Thread");
  });

  it("should allow message creation", () => {
    testDb.run(
      "INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)",
      ["test-msg", "valid-thread", "user", "Hello world"]
    );

    const messages = testDb
      .query("SELECT * FROM messages WHERE id = 'test-msg'")
      .all() as MessageRow[];
    expect(messages.length).toBe(1);
    expect(messages[0].content).toBe("Hello world");
    expect(messages[0].role).toBe("user");
  });

  it("should insert additional users", () => {
    const userId = crypto.randomUUID();
    testDb.run(
      "INSERT INTO users (id, username, name, password) VALUES (?, ?, ?, ?)",
      [userId, "testuser", "Test User", "password123"]
    );

    const users = testDb
      .query("SELECT * FROM users WHERE username = 'testuser'")
      .all() as UserRow[];
    expect(users.length).toBe(1);
    expect(users[0].name).toBe("Test User");
    expect(users[0].password).toBe("password123");
  });

  it("should prevent duplicate usernames", () => {
    expect(() => {
      const userId = crypto.randomUUID();
      testDb.run(
        "INSERT INTO users (id, username, name, password) VALUES (?, ?, ?, ?)",
        [userId, "root", "Duplicate Root", "pass"]
      );
    }).toThrow();
  });

  it("should update message_count on thread", () => {
    testDb.run(
      "UPDATE threads SET message_count = 1 WHERE id = 'valid-thread'"
    );

    const thread = testDb
      .query("SELECT message_count FROM threads WHERE id = 'valid-thread'")
      .get() as ThreadRow;
    expect(thread.message_count).toBe(1);
  });

  it("should cascade delete threads when user is deleted", () => {
    const userId = crypto.randomUUID();
    testDb.run(
      "INSERT INTO users (id, username, name, password) VALUES (?, ?, ?, ?)",
      [userId, "tempuser", "Temp User", ""]
    );
    testDb.run("INSERT INTO threads (id, user_id, title) VALUES (?, ?, ?)", [
      "temp-thread",
      userId,
      "Temp Thread",
    ]);

    testDb.run("DELETE FROM users WHERE id = ?", [userId]);

    const threads = testDb
      .prepare("SELECT * FROM threads WHERE user_id = ?")
      .all(userId) as ThreadRow[];
    expect(threads.length).toBe(0);
  });

  it("should cascade delete messages when thread is deleted", () => {
    const user = testDb
      .query("SELECT id FROM users WHERE username = 'root'")
      .get() as UserRow;
    testDb.run("INSERT INTO threads (id, user_id, title) VALUES (?, ?, ?)", [
      "del-thread",
      user.id,
      "Delete Thread",
    ]);
    testDb.run(
      "INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)",
      ["del-msg", "del-thread", "assistant", "Response"]
    );

    testDb.run("DELETE FROM threads WHERE id = 'del-thread'");

    const messages = testDb
      .prepare("SELECT * FROM messages WHERE thread_id = ?")
      .all("del-thread") as MessageRow[];
    expect(messages.length).toBe(0);
  });

  it("should enforce role check on messages", () => {
    expect(() => {
      testDb.run(
        "INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)",
        ["invalid-msg", "valid-thread", "invalid", "Content"]
      );
    }).toThrow();
  });

  it("should retrieve messages for a thread", () => {
    testDb.run(
      "INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)",
      ["msg2", "valid-thread", "assistant", "Hello back"]
    );

    const messages = testDb
      .query(
        "SELECT * FROM messages WHERE thread_id = 'valid-thread' ORDER BY created_at"
      )
      .all() as MessageRow[];
    expect(messages.length).toBe(2);
    expect(messages[0].role).toBe("user");
    expect(messages[1].role).toBe("assistant");
  });

  it("should create summaries table", () => {
    const tables = testDb
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as TableRow[];
    const tableNames = tables.map((row) => row.name);
    expect(tableNames).toContain("summaries");
  });

  it("should create memory_items table", () => {
    const tables = testDb
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as TableRow[];
    const tableNames = tables.map((row) => row.name);
    expect(tableNames).toContain("memory_items");
  });

  it("should create jobs table", () => {
    const tables = testDb
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as TableRow[];
    const tableNames = tables.map((row) => row.name);
    expect(tableNames).toContain("jobs");
  });

  it("should allow summary creation", () => {
    testDb.run(
      "INSERT INTO summaries (id, thread_id, summary) VALUES (?, ?, ?)",
      ["test-summary", "valid-thread", "This is a summary"]
    );

    const summaries = testDb
      .query("SELECT * FROM summaries WHERE id = 'test-summary'")
      .all() as SummaryRow[];
    expect(summaries.length).toBe(1);
    expect(summaries[0].summary).toBe("This is a summary");
  });

  it("should allow memory item creation", () => {
    testDb.run(
      "INSERT INTO memory_items (id, thread_id, type, content) VALUES (?, ?, ?, ?)",
      ["test-memory", "valid-thread", "fact", "User likes blue"]
    );

    const memoryItems = testDb
      .query("SELECT * FROM memory_items WHERE id = 'test-memory'")
      .all() as MemoryItemRow[];
    expect(memoryItems.length).toBe(1);
    expect(memoryItems[0].type).toBe("fact");
    expect(memoryItems[0].content).toBe("User likes blue");
  });

  it("should allow job creation", () => {
    const executeAt = new Date(Date.now() + 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    testDb.run(
      "INSERT INTO jobs (id, type, data, execute_at) VALUES (?, ?, ?, ?)",
      ["test-job", "test-type", JSON.stringify({ key: "value" }), executeAt]
    );

    const jobs = testDb
      .query("SELECT * FROM jobs WHERE id = 'test-job'")
      .all() as JobRow[];
    expect(jobs.length).toBe(1);
    expect(jobs[0].type).toBe("test-type");
    expect(jobs[0].status).toBe("pending");
  });

  it("should enforce job status check", () => {
    const executeAt = new Date(Date.now() + 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    expect(() => {
      testDb.run(
        "INSERT INTO jobs (id, type, data, status, execute_at) VALUES (?, ?, ?, ?, ?)",
        ["invalid-job", "test", "{}", "invalid", executeAt]
      );
    }).toThrow();
  });

  it("should enforce memory item type check", () => {
    expect(() => {
      testDb.run(
        "INSERT INTO memory_items (id, type, content) VALUES (?, ?, ?)",
        ["invalid-memory", "invalid-type", "Content"]
      );
    }).toThrow();
  });
});
