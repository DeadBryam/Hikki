import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { SessionRepository } from "@/database/repositories/session-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import type { Session } from "@/types/auth";
import {
  createSessionRepository,
  createUserRepository,
} from "../helpers/di-factories";

describe("Session Repository", () => {
  let sessionRepo: SessionRepository;
  let userRepo: UserRepository;
  let testUserId: string;
  let testUsername: string;
  let testEmail: string;
  let testSessionId: string;
  let testToken: string;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;
    sessionRepo = createSessionRepository(db);
    userRepo = createUserRepository(db);
    await initDatabase();

    const timestamp = Date.now();
    testUserId = `test-user-session-${timestamp}`;
    testUsername = `sessionuser${timestamp}`;
    testEmail = `session${timestamp}@example.com`;
    testSessionId = `test-session-${timestamp}`;
    testToken = `test-token-${timestamp}`;

    const userData = {
      id: testUserId,
      username: testUsername,
      email: testEmail,
      name: "Session User",
      password: "hashedpassword",
      deleted_at: null,
      validated_at: null,
    };
    userRepo.create(userData);
  });

  it("should create a session", () => {
    const sessionData: Omit<Session, "created_at"> = {
      id: testSessionId,
      user_id: testUserId,
      token: testToken,
      ip_address: "127.0.0.1",
      expires_at: Date.now() + 24 * 60 * 60 * 1000,
      user_agent: null,
    };

    expect(() => sessionRepo.create(sessionData)).not.toThrow();
  });

  it("should find session by id", () => {
    const session = sessionRepo.findById(testSessionId);
    expect(session).toBeDefined();
    expect(session?.token).toBe(testToken);
    expect(session?.user_id).toBe(testUserId);
  });

  it("should find session by token", () => {
    const session = sessionRepo.findByToken(testToken);
    expect(session).toBeDefined();
    expect(session?.id).toBe(testSessionId);
    expect(session?.user_id).toBe(testUserId);
  });

  it("should find session with user data", () => {
    const sessionWithUser = sessionRepo.findByTokenWithUser(testToken);
    expect(sessionWithUser).toBeDefined();
    expect(sessionWithUser?.session.id).toBe(testSessionId);
    expect(sessionWithUser?.user.username).toBe(testUsername);
    expect(sessionWithUser?.user.email).toBe(testEmail);
  });

  it("should return null for expired session", () => {
    const timestamp = Date.now();
    const expiredSessionId = `expired-session-${timestamp}`;
    const expiredToken = `expired-token-${timestamp}`;
    const expiredSession: Omit<Session, "created_at"> = {
      id: expiredSessionId,
      user_id: testUserId,
      token: expiredToken,
      ip_address: "127.0.0.1",
      expires_at: Date.now() - 1000,
      user_agent: null,
    };
    sessionRepo.create(expiredSession);

    const session = sessionRepo.findByToken(expiredToken);
    expect(session).toBeNull();
  });

  it("should return null for non-existent token", () => {
    const session = sessionRepo.findByToken("non-existent-token");
    expect(session).toBeNull();
  });

  it("should delete session by id", () => {
    sessionRepo.deleteById(testSessionId);

    const session = sessionRepo.findById(testSessionId);
    expect(session).toBeNull();
  });
});
