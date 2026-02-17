import { and, eq, gt, isNull, lte } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { SessionWithUser } from "@/types/auth";
import type * as schema from "../schema";
import { sessions, users } from "../schema";

interface SessionRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export class SessionRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: SessionRepositoryDeps) {
    this.db = db;
  }

  create(session: {
    id: string;
    user_id: string;
    token: string;
    ip_address: string | null;
    user_agent: string | null;
    expires_at: number;
  }): void {
    this.db.insert(sessions).values(session).run();
  }

  findById(id: string) {
    const result = this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, id), gt(sessions.expires_at, Date.now())))
      .get();
    return result || null;
  }

  findByToken(token: string) {
    const result = this.db
      .select()
      .from(sessions)
      .where(
        and(eq(sessions.token, token), gt(sessions.expires_at, Date.now()))
      )
      .get();
    return result || null;
  }

  deleteById(id: string): void {
    this.db.delete(sessions).where(eq(sessions.id, id)).run();
  }

  deleteByUserId(userId: string): void {
    this.db.delete(sessions).where(eq(sessions.user_id, userId)).run();
  }

  extendSession(sessionId: string, newExpiresAt: number): void {
    this.db
      .update(sessions)
      .set({ expires_at: newExpiresAt })
      .where(eq(sessions.id, sessionId))
      .run();
  }

  deleteExpired(beforeTimestamp: number): number {
    const toDelete = this.db
      .select({ id: sessions.id })
      .from(sessions)
      .where(lte(sessions.expires_at, beforeTimestamp))
      .all();

    if (toDelete.length > 0) {
      this.db
        .delete(sessions)
        .where(lte(sessions.expires_at, beforeTimestamp))
        .run();
    }

    return toDelete.length;
  }

  findByTokenWithUser(token: string): SessionWithUser | null {
    const result = this.db
      .select({
        session_id: sessions.id,
        user_id: sessions.user_id,
        token: sessions.token,
        ip_address: sessions.ip_address,
        user_agent: sessions.user_agent,
        session_expires_at: sessions.expires_at,
        session_created_at: sessions.created_at,
        username: users.username,
        email: users.email,
        name: users.name,
        password: users.password,
        deleted_at: users.deleted_at,
        validated_at: users.validated_at,
        onboarding_completed_at: users.onboarding_completed_at,
        user_created_at: users.created_at,
        user_updated_at: users.updated_at,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.user_id, users.id))
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expires_at, Date.now()),
          isNull(users.deleted_at)
        )
      )
      .get();

    if (!result) {
      return null;
    }

    return {
      session: {
        id: result.session_id,
        user_id: result.user_id,
        token: result.token,
        ip_address: result.ip_address,
        user_agent: result.user_agent,
        expires_at: result.session_expires_at,
        created_at: result.session_created_at || "",
      },
      user: {
        id: result.user_id,
        username: result.username,
        email: result.email || "",
        name: result.name || "",
        deleted_at: result.deleted_at,
        validated_at: result.validated_at,
        onboarding_completed_at: result.onboarding_completed_at,
      },
    };
  }
}
