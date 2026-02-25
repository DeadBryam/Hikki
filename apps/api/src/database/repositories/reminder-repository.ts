import { and, desc, eq, sql } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { reminderEmitter } from "@/services/reminder-events";
import type * as schema from "../schema";
import { reminders } from "../schema";

interface ReminderRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export class ReminderRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: ReminderRepositoryDeps) {
    this.db = db;
  }

  createReminder(item: {
    userId: string;
    message: string;
    type: "one-time" | "recurrent";
    scheduleAt: string;
    repeatPattern?: string;
    channel: "in-app" | "email" | "push" | "all";
    jobId?: string;
  }): schema.ReminderSelect {
    const id = crypto.randomUUID();
    this.db
      .insert(reminders)
      .values({
        id,
        user_id: item.userId,
        message: item.message,
        type: item.type,
        schedule_at: item.scheduleAt,
        repeat_pattern: item.repeatPattern || null,
        channel: item.channel,
        job_id: item.jobId || null,
      })
      .run();

    reminderEmitter.emitReminderCreated(item.userId, id);
    return this.getReminderById(id) as schema.ReminderSelect;
  }

  getReminderById(id: string): schema.ReminderSelect | undefined {
    return this.db.select().from(reminders).where(eq(reminders.id, id)).get();
  }

  getRemindersByUser(userId: string): schema.ReminderSelect[] {
    return this.db
      .select()
      .from(reminders)
      .where(and(eq(reminders.user_id, userId), eq(reminders.status, "active")))
      .orderBy(desc(reminders.created_at))
      .all();
  }

  getRemindersByUserAll(userId: string): schema.ReminderSelect[] {
    return this.db
      .select()
      .from(reminders)
      .where(eq(reminders.user_id, userId))
      .orderBy(desc(reminders.created_at))
      .all();
  }

  getPendingReminders(): schema.ReminderSelect[] {
    const now = new Date().toISOString();
    return this.db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.status, "active"),
          sql`${reminders.schedule_at} <= ${now}`
        )
      )
      .all();
  }

  updateReminderStatus(
    id: string,
    status: "active" | "completed" | "cancelled"
  ): void {
    this.db
      .update(reminders)
      .set({ status, updated_at: new Date().toISOString() })
      .where(eq(reminders.id, id))
      .run();
  }

  markAsTriggered(id: string): void {
    this.db
      .update(reminders)
      .set({
        triggered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .where(eq(reminders.id, id))
      .run();
  }

  deleteReminder(id: string, userId: string): void {
    this.db
      .update(reminders)
      .set({ status: "cancelled", updated_at: new Date().toISOString() })
      .where(and(eq(reminders.id, id), eq(reminders.user_id, userId)))
      .run();
    reminderEmitter.emitReminderCancelled(userId, id);
  }

  rescheduleReminder(id: string, newScheduleAt: string): void {
    this.db
      .update(reminders)
      .set({ schedule_at: newScheduleAt, updated_at: new Date().toISOString() })
      .where(eq(reminders.id, id))
      .run();
  }
}
