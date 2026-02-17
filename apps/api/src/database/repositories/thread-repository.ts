import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  like,
  lte,
  sql,
} from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type * as schema from "../schema";
import { threads } from "../schema";

interface ThreadRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export interface GetThreadsFilters {
  archived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
  search?: string;
  sortBy?: "created_at" | "updated_at" | "title";
  sortOrder?: "asc" | "desc";
  userId: string;
}

export interface CountThreadsFilters {
  archived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  userId: string;
}

export class ThreadRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: ThreadRepositoryDeps) {
    this.db = db;
  }

  getThreadsByUserId(userId: string) {
    return this.db
      .select()
      .from(threads)
      .where(and(eq(threads.user_id, userId), isNull(threads.deleted_at)))
      .orderBy(desc(threads.updated_at))
      .all();
  }

  getThreadsPaginatedByUserId(userId: string, limit: number, offset: number) {
    return this.db
      .select()
      .from(threads)
      .where(and(eq(threads.user_id, userId), isNull(threads.deleted_at)))
      .orderBy(desc(threads.updated_at))
      .limit(limit)
      .offset(offset)
      .all();
  }

  countThreadsByUserId(userId: string): number {
    const result = this.db
      .select({ count: sql<number>`count(*)` })
      .from(threads)
      .where(and(eq(threads.user_id, userId), isNull(threads.deleted_at)))
      .get();
    return result?.count || 0;
  }

  archiveThread(threadId: string): void {
    this.db
      .update(threads)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(threads.id, threadId))
      .run();
  }

  findById(id: string) {
    const result = this.db
      .select()
      .from(threads)
      .where(eq(threads.id, id))
      .get();
    return result || null;
  }

  create(thread: {
    id: string;
    user_id: string;
    title: string;
    message_count: number;
  }): void {
    this.db.insert(threads).values(thread).run();
  }

  updateMessageCount(threadId: string): void {
    this.db
      .update(threads)
      .set({
        message_count: sql`message_count + 1`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(threads.id, threadId))
      .run();
  }

  getAll() {
    return this.db.select().from(threads).all();
  }

  updateTitle(threadId: string, title: string): void {
    this.db
      .update(threads)
      .set({
        title,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(threads.id, threadId))
      .run();
  }

  initializeThread(
    threadId: string,
    userId: string
  ): { thread: typeof threads.$inferSelect | null; isNew: boolean } {
    return this.db.transaction((tx) => {
      let thread = tx
        .select()
        .from(threads)
        .where(eq(threads.id, threadId))
        .get();

      const isNew = !thread;
      if (!thread) {
        const newThread = {
          id: threadId,
          user_id: userId,
          title: `Chat ${threadId.slice(0, 8)}`,
          message_count: 0,
        };
        tx.insert(threads).values(newThread).run();
        thread = tx
          .select()
          .from(threads)
          .where(eq(threads.id, threadId))
          .get();
      }
      return { thread: thread || null, isNew };
    });
  }

  getThreadsWithFilters(filters: GetThreadsFilters) {
    const {
      userId,
      limit,
      offset,
      search,
      archived,
      dateFrom,
      dateTo,
      sortBy = "updated_at",
      sortOrder = "desc",
    } = filters;

    const whereConditions = [eq(threads.user_id, userId)];

    if (archived === true) {
      whereConditions.push(isNotNull(threads.deleted_at));
    } else if (archived === false) {
      whereConditions.push(isNull(threads.deleted_at));
    }

    if (search) {
      whereConditions.push(like(threads.title, `%${search}%`));
    }

    if (dateFrom) {
      whereConditions.push(gte(threads.created_at, dateFrom));
    }
    if (dateTo) {
      whereConditions.push(lte(threads.created_at, dateTo));
    }

    let column:
      | typeof threads.title
      | typeof threads.created_at
      | typeof threads.updated_at;
    if (sortBy === "title") {
      column = threads.title;
    } else if (sortBy === "created_at") {
      column = threads.created_at;
    } else {
      column = threads.updated_at;
    }

    const orderBy = sortOrder === "asc" ? asc(column) : desc(column);

    return this.db
      .select()
      .from(threads)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all();
  }

  countThreadsWithFilters(filters: CountThreadsFilters): number {
    const { userId, search, archived, dateFrom, dateTo } = filters;

    const whereConditions = [eq(threads.user_id, userId)];

    if (archived === true) {
      whereConditions.push(isNotNull(threads.deleted_at));
    } else if (archived === false) {
      whereConditions.push(isNull(threads.deleted_at));
    }

    if (search) {
      whereConditions.push(like(threads.title, `%${search}%`));
    }

    if (dateFrom) {
      whereConditions.push(gte(threads.created_at, dateFrom));
    }
    if (dateTo) {
      whereConditions.push(lte(threads.created_at, dateTo));
    }

    const result = this.db
      .select({ count: sql<number>`count(*)` })
      .from(threads)
      .where(and(...whereConditions))
      .get();

    return result?.count || 0;
  }
}
