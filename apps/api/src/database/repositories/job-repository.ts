import { and, desc, eq, lte, sql } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { UpdateJobParams } from "@/types/job";
import type * as schema from "../schema";
import { jobs } from "../schema";

interface JobRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export class JobRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: JobRepositoryDeps) {
    this.db = db;
  }

  create(job: {
    type: string;
    data: string;
    execute_at: string;
    status?: string;
    recurrent?: boolean;
    interval_ms?: number;
    max_runs?: number | null;
    current_runs?: number;
  }): string {
    const id = crypto.randomUUID();
    this.db
      .insert(jobs)
      .values({
        id,
        type: job.type,
        data: job.data,
        execute_at: job.execute_at,
        status:
          (job.status as "pending" | "processing" | "completed" | "failed") ||
          "pending",
        recurrent: job.recurrent,
        interval_ms: job.interval_ms,
        max_runs: job.max_runs,
        current_runs: job.current_runs || 0,
      })
      .run();
    return id;
  }

  findPendingJobs() {
    return this.db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.status, "pending"),
          lte(jobs.execute_at, sql`CURRENT_TIMESTAMP`)
        )
      )
      .all();
  }

  updateStatus(id: string, status: string, reason: string | null = null): void {
    this.db
      .update(jobs)
      .set({
        status: status as "pending" | "processing" | "completed" | "failed",
        updated_at: sql`CURRENT_TIMESTAMP`,
        reason,
      })
      .where(eq(jobs.id, id))
      .run();
  }

  updateJob(id: string, updates: Partial<UpdateJobParams>): void {
    this.db
      .update(jobs)
      .set({
        ...updates,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(jobs.id, id))
      .run();
  }

  markAsProcessing(id: string): void {
    this.db.transaction((tx) => {
      tx.update(jobs)
        .set({
          status: "processing",
          updated_at: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(jobs.id, id))
        .run();
    });
  }

  markAsCompleted(id: string): void {
    this.updateStatus(id, "completed");
  }

  markAsFailed(id: string, reason?: string): void {
    this.updateStatus(id, "failed", reason || null);
  }

  findAllJobs() {
    return this.db.select().from(jobs).orderBy(desc(jobs.created_at)).all();
  }

  updateJobService(jobId: string, service: string): void {
    this.db.update(jobs).set({ service }).where(eq(jobs.id, jobId)).run();
  }

  incrementRetryCount(jobId: string): void {
    this.db
      .update(jobs)
      .set({
        retry_count: sql`${jobs.retry_count} + 1`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(jobs.id, jobId))
      .run();
  }

  getRetryCount(jobId: string): number {
    const result = this.db
      .select({ retry_count: jobs.retry_count })
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .get();
    return result?.retry_count || 0;
  }

  incrementCurrentRuns(jobId: string): void {
    this.db
      .update(jobs)
      .set({
        current_runs: sql`${jobs.current_runs} + 1`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(jobs.id, jobId))
      .run();
  }

  deleteExpiredPendingJobs(olderThanHours: number): number {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);
    const cutoffTimestamp = cutoffDate.toISOString();

    const toDelete = this.db
      .select({ id: jobs.id })
      .from(jobs)
      .where(
        and(eq(jobs.status, "pending"), lte(jobs.execute_at, cutoffTimestamp))
      )
      .all();

    if (toDelete.length > 0) {
      this.db
        .delete(jobs)
        .where(
          and(eq(jobs.status, "pending"), lte(jobs.execute_at, cutoffTimestamp))
        )
        .run();
    }

    return toDelete.length;
  }

  deleteStuckJobs(olderThanHours: number): number {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);
    const cutoffTimestamp = cutoffDate.toISOString();

    const toDelete = this.db
      .select({ id: jobs.id })
      .from(jobs)
      .where(
        and(
          eq(jobs.status, "processing"),
          lte(jobs.updated_at, cutoffTimestamp)
        )
      )
      .all();

    if (toDelete.length > 0) {
      this.db
        .delete(jobs)
        .where(
          and(
            eq(jobs.status, "processing"),
            lte(jobs.updated_at, cutoffTimestamp)
          )
        )
        .run();
    }

    return toDelete.length;
  }
}
