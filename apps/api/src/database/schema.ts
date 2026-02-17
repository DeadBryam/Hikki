import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  name: text("name"),
  password: text("password"),
  deleted_at: text("deleted_at"),
  validated_at: text("validated_at"),
  onboarding_completed_at: text("onboarding_completed_at"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const threads = sqliteTable(
  "threads",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message_count: integer("message_count").default(0),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
    deleted_at: text("deleted_at"),
  },
  (table) => [index("idx_threads_user_id").on(table.user_id)]
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    thread_id: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    service: text("service"),
    summarized: integer("summarized", { mode: "boolean" }).default(false),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_messages_thread_id").on(table.thread_id)]
);

export const summaries = sqliteTable("summaries", {
  id: text("id").primaryKey(),
  thread_id: text("thread_id")
    .notNull()
    .unique()
    .references(() => threads.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const memoryItems = sqliteTable("memory_items", {
  id: text("id").primaryKey(),
  thread_id: text("thread_id").references(() => threads.id, {
    onDelete: "cascade",
  }),
  type: text("type", {
    enum: ["fact", "personality", "event", "other"],
  }).notNull(),
  content: text("content").notNull(),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  deleted_at: text("deleted_at"),
});

export const jobs = sqliteTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    data: text("data").notNull(),
    status: text("status", {
      enum: ["pending", "processing", "completed", "failed"],
    })
      .default("pending")
      .notNull(),
    service: text("service"),
    reason: text("reason"),
    retry_count: integer("retry_count").default(0).notNull(),
    execute_at: text("execute_at").notNull(),
    recurrent: integer("recurrent", { mode: "boolean" })
      .default(false)
      .notNull(),
    interval_ms: integer("interval_ms"),
    max_runs: integer("max_runs"),
    current_runs: integer("current_runs").default(0).notNull(),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    index("idx_jobs_status").on(table.status),
    index("idx_jobs_execute_at").on(table.execute_at),
    index("idx_jobs_retry_count").on(table.retry_count),
  ]
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    ip_address: text("ip_address"),
    user_agent: text("user_agent"),
    expires_at: integer("expires_at").notNull(),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_sessions_token").on(table.token),
    index("idx_sessions_expires_at").on(table.expires_at),
    index("idx_sessions_user_id").on(table.user_id),
  ]
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    type: text("type", {
      enum: ["email_verification", "password_reset"],
    }).notNull(),
    expires_at: text("expires_at").notNull(),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_verification_tokens_token").on(table.token),
    index("idx_verification_tokens_user_id").on(table.user_id),
  ]
);

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type ThreadSelect = typeof threads.$inferSelect;
export type ThreadInsert = typeof threads.$inferInsert;

export type MessageSelect = typeof messages.$inferSelect;
export type MessageInsert = typeof messages.$inferInsert;

export type SummarySelect = typeof summaries.$inferSelect;
export type SummaryInsert = typeof summaries.$inferInsert;

export type MemoryItemSelect = typeof memoryItems.$inferSelect;
export type MemoryItemInsert = typeof memoryItems.$inferInsert;

export type JobSelect = typeof jobs.$inferSelect;
export type JobInsert = typeof jobs.$inferInsert;

export type SessionSelect = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;

export type VerificationTokenSelect = typeof verificationTokens.$inferSelect;
export type VerificationTokenInsert = typeof verificationTokens.$inferInsert;
