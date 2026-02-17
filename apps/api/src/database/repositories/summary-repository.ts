import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type * as schema from "../schema";
import { summaries } from "../schema";

interface SummaryRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export class SummaryRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: SummaryRepositoryDeps) {
    this.db = db;
  }

  saveSummary(summary: { thread_id: string; summary: string }): void {
    const id = crypto.randomUUID();

    const existing = this.getSummary(summary.thread_id);
    if (existing) {
      this.db
        .update(summaries)
        .set({
          summary: summary.summary,
          updated_at: new Date().toISOString(),
        })
        .where(eq(summaries.thread_id, summary.thread_id))
        .run();
    } else {
      this.db
        .insert(summaries)
        .values({
          id,
          thread_id: summary.thread_id,
          summary: summary.summary,
        })
        .run();
    }
  }

  getSummary(threadId: string) {
    const result = this.db
      .select()
      .from(summaries)
      .where(eq(summaries.thread_id, threadId))
      .get();
    return result || null;
  }
}
