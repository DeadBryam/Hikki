import { and, eq, isNull } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { User, UserWithoutPassword } from "@/types/auth";
import type * as schema from "../schema";
import { users } from "../schema";

interface UserRepositoryDeps {
  db: BunSQLiteDatabase<typeof schema>;
}

export class UserRepository {
  private readonly db: BunSQLiteDatabase<typeof schema>;

  constructor({ db }: UserRepositoryDeps) {
    this.db = db;
  }

  create(user: {
    id: string;
    username: string;
    email: string | null;
    name: string | null;
    password: string | null;
    deleted_at: string | null;
    validated_at: string | null;
    onboarding_completed_at: string | null;
  }): void {
    this.db.insert(users).values(user).run();
  }

  findByUsername(username: string): UserWithoutPassword | null {
    const result = this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        deleted_at: users.deleted_at,
        validated_at: users.validated_at,
        onboarding_completed_at: users.onboarding_completed_at,
      })
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deleted_at)))
      .get();
    return result || null;
  }

  findByUsernameWithPassword(username: string): User | null {
    const result = this.db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deleted_at)))
      .get();
    return result || null;
  }

  findByEmail(email: string): UserWithoutPassword | null {
    const result = this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        deleted_at: users.deleted_at,
        validated_at: users.validated_at,
        onboarding_completed_at: users.onboarding_completed_at,
      })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deleted_at)))
      .get();
    return result || null;
  }

  findById(id: string): UserWithoutPassword | null {
    const result = this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        deleted_at: users.deleted_at,
        validated_at: users.validated_at,
        onboarding_completed_at: users.onboarding_completed_at,
      })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deleted_at)))
      .get();
    return result || null;
  }

  setEmailVerified(id: string, verified: boolean): void {
    const now = new Date().toISOString();
    this.db
      .update(users)
      .set({
        validated_at: verified ? now : null,
        updated_at: now,
      })
      .where(eq(users.id, id))
      .run();
  }

  updatePassword(id: string, hashedPassword: string): void {
    this.db
      .update(users)
      .set({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .run();
  }

  softDelete(id: string): void {
    const now = new Date().toISOString();
    this.db
      .update(users)
      .set({
        deleted_at: now,
        updated_at: now,
      })
      .where(eq(users.id, id))
      .run();
  }

  completeOnboarding(id: string): void {
    const now = new Date().toISOString();
    this.db
      .update(users)
      .set({
        onboarding_completed_at: now,
        updated_at: now,
      })
      .where(eq(users.id, id))
      .run();
  }
}
