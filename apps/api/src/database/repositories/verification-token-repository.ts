import { and, eq, gt, lt } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type * as schema from "../schema";
import { verificationTokens } from "../schema";

interface VerificationTokenRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export interface VerificationToken {
  created_at: string | null;
  expires_at: string;
  id: string;
  token: string;
  type: "email_verification" | "password_reset";
  user_id: string;
}

export class VerificationTokenRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: VerificationTokenRepositoryDeps) {
    this.db = db;
  }

  create(token: Omit<VerificationToken, "created_at">): void {
    this.db.insert(verificationTokens).values(token).run();
  }

  findByToken(token: string): VerificationToken | null {
    const now = new Date().toISOString();
    const result = this.db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, token),
          gt(verificationTokens.expires_at, now)
        )
      )
      .get();
    return (result as VerificationToken) || null;
  }

  findByUserId(
    userId: string,
    type: "email_verification" | "password_reset"
  ): VerificationToken | null {
    const now = new Date().toISOString();
    const result = this.db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.user_id, userId),
          eq(verificationTokens.type, type),
          gt(verificationTokens.expires_at, now)
        )
      )
      .get();
    return (result as VerificationToken) || null;
  }

  delete(id: string): void {
    this.db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, id))
      .run();
  }

  deleteByUserId(
    userId: string,
    type: "email_verification" | "password_reset"
  ): void {
    this.db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.user_id, userId),
          eq(verificationTokens.type, type)
        )
      )
      .run();
  }

  deleteExpired(): void {
    const now = new Date().toISOString();
    this.db
      .delete(verificationTokens)
      .where(lt(verificationTokens.expires_at, now))
      .run();
  }
}
