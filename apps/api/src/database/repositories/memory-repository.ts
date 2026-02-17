import { and, desc, eq, type SQL } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type * as schema from "../schema";
import { memoryItems } from "../schema";

interface MemoryRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export class MemoryRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: MemoryRepositoryDeps) {
    this.db = db;
  }

  saveMemoryItem(item: {
    thread_id?: string;
    type: "fact" | "personality" | "event" | "other";
    content: string;
  }): void {
    const id = crypto.randomUUID();
    this.db
      .insert(memoryItems)
      .values({
        id,
        thread_id: item.thread_id || null,
        type: item.type,
        content: item.content,
      })
      .run();
  }

  getMemoryByType(threadId?: string, type?: string) {
    const conditions: SQL[] = [];

    if (threadId) {
      conditions.push(eq(memoryItems.thread_id, threadId));
    }
    if (type) {
      conditions.push(
        eq(memoryItems.type, type as "fact" | "personality" | "event" | "other")
      );
    }

    if (conditions.length === 0) {
      return this.db
        .select()
        .from(memoryItems)
        .orderBy(desc(memoryItems.created_at))
        .all();
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
}
