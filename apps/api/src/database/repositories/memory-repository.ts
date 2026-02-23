import { and, desc, eq, type SQL, sql } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type * as schema from "../schema";
import { memoryItems } from "../schema";

// Regex for splitting search query into terms
const WHITESPACE_REGEX = /\s+/;

interface MemoryRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export class MemoryRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: MemoryRepositoryDeps) {
    this.db = db;
  }

  saveMemoryItem(item: {
    userId: string;
    thread_id?: string;
    type: "fact" | "personality" | "event" | "other";
    content: string;
  }): void {
    const id = crypto.randomUUID();
    this.db
      .insert(memoryItems)
      .values({
        id,
        user_id: item.userId,
        thread_id: item.thread_id || null,
        type: item.type,
        content: item.content,
      })
      .run();
  }

  getMemoryByType(userId: string, threadId?: string, type?: string) {
    const conditions: SQL[] = [eq(memoryItems.user_id, userId)];

    if (threadId) {
      conditions.push(eq(memoryItems.thread_id, threadId));
    }
    if (type) {
      conditions.push(
        eq(memoryItems.type, type as "fact" | "personality" | "event" | "other")
      );
    }

    if (conditions.length === 1) {
      return this.db
        .select()
        .from(memoryItems)
        .where(conditions[0])
        .orderBy(desc(memoryItems.created_at))
        .all();
    }

    return this.db
      .select()
      .from(memoryItems)
      .where(and(...conditions))
      .orderBy(desc(memoryItems.created_at))
      .all();
  }

  deleteMemory(id: string, userId: string): void {
    this.db
      .update(memoryItems)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(memoryItems.id, id), eq(memoryItems.user_id, userId)))
      .run();
  }

  getMemoriesByUser(userId: string): schema.MemoryItemSelect[] {
    return this.db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.user_id, userId))
      .orderBy(desc(memoryItems.created_at))
      .all();
  }

  searchMemories(userId: string, query: string): schema.MemoryItemSelect[] {
    // Use FTS5 MATCH with BM25 ranking
    const searchQuery = query
      .split(WHITESPACE_REGEX)
      .filter((term) => term.length > 0)
      .map((term) => `"${term}"`)
      .join(" OR ");

    if (!searchQuery) {
      return [];
    }

    return this.db
      .select({
        id: memoryItems.id,
        user_id: memoryItems.user_id,
        thread_id: memoryItems.thread_id,
        type: memoryItems.type,
        content: memoryItems.content,
        created_at: memoryItems.created_at,
        updated_at: memoryItems.updated_at,
        deleted_at: memoryItems.deleted_at,
      })
      .from(memoryItems)
      .innerJoin(
        sql`memory_items_fts`,
        sql`${memoryItems.id} = memory_items_fts.id`
      )
      .where(
        and(
          eq(memoryItems.user_id, userId),
          sql`memory_items_fts MATCH ${searchQuery}`
        )
      )
      .orderBy(sql`bm25(memory_items_fts)`)
      .all();
  }
}
