import { and, asc, eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type * as schema from "../schema";
import { messages } from "../schema";
import type { ThreadRepository } from "./thread-repository";

interface MessageRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
  threadRepository: ThreadRepository;
}

export class MessageRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;
  private readonly threadRepo: ThreadRepository;

  constructor({ db, threadRepository }: MessageRepositoryDeps) {
    this.db = db;
    this.threadRepo = threadRepository;
  }

  getPaginatedMessages(threadId: string, limit: number, offset: number) {
    return this.db
      .select({
        id: messages.id,
        thread_id: messages.thread_id,
        role: messages.role,
        content: messages.content,
        service: messages.service,
        created_at: messages.created_at,
      })
      .from(messages)
      .where(eq(messages.thread_id, threadId))
      .orderBy(asc(messages.created_at))
      .limit(limit)
      .offset(offset)
      .all();
  }

  getNotSummarizedMessages(threadId: string) {
    return this.db
      .select()
      .from(messages)
      .where(
        and(eq(messages.thread_id, threadId), eq(messages.summarized, false))
      )
      .orderBy(asc(messages.created_at))
      .all();
  }

  getAllMessages(threadId: string) {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.thread_id, threadId))
      .orderBy(asc(messages.created_at))
      .all();
  }

  saveMessage(message: {
    thread_id: string;
    role: "user" | "assistant";
    content: string;
    service?: string;
    summarized?: boolean;
  }): void {
    const id = crypto.randomUUID();
    this.db
      .insert(messages)
      .values({
        id,
        thread_id: message.thread_id,
        role: message.role,
        content: message.content,
        service: message.service || null,
        summarized: message.summarized ?? false,
      })
      .run();
  }

  saveMessageAndUpdateCount(
    message: {
      thread_id: string;
      role: "user" | "assistant";
      content: string;
      service?: string;
      summarized?: boolean;
    },
    threadId: string
  ): void {
    this.db.transaction((tx) => {
      const id = crypto.randomUUID();
      tx.insert(messages)
        .values({
          id,
          thread_id: message.thread_id,
          role: message.role,
          content: message.content,
          service: message.service || null,
          summarized: message.summarized ?? false,
        })
        .run();
      this.threadRepo.updateMessageCount(threadId);
    });
  }
}
