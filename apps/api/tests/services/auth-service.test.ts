import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import { sessions, users } from "@/database/schema";
import type AuthService from "@/services/auth";
import {
  createAuthService,
  createSessionRepository,
  createUserRepository,
} from "../helpers/di-factories";

describe("Auth Services", () => {
  let authService: AuthService;
  let userRepo: any;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;

    db.delete(sessions).run();
    db.delete(users).run();

    userRepo = createUserRepository(db);
    const sessionRepo = createSessionRepository(db);
    authService = createAuthService(userRepo, sessionRepo);
  });

  describe("Password Functions", () => {
    it("should hash password", async () => {
      const password = "testpassword123";
      const hash = await authService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).not.toBe(password);
    });

    it("should verify correct password", async () => {
      const password = "testpassword123";
      const hash = await authService.hashPassword(password);

      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testpassword123";
      const hash = await authService.hashPassword(password);

      const isValid = await authService.verifyPassword("wrongpassword", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("User Management", () => {
    const testTimestamp = Date.now();
    const testUsername = `testauthuser${testTimestamp}`;

    it("should create user", async () => {
      const userData = {
        username: testUsername,
        email: `auth${testTimestamp}@example.com`,
        password: "testpass123",
        name: "Auth Test User",
      };

      const user = await authService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe(testUsername);
      expect(user.email).toBe(`auth${testTimestamp}@example.com`);
      expect(user.name).toBe("Auth Test User");
      expect(user.password).not.toBe("testpass123");
    });

    it("should find user by username", () => {
      const user = authService.findUserByUsername(testUsername);
      expect(user).toBeDefined();
      expect(user?.username).toBe(testUsername);
    });
  });

  describe("Session Management", () => {
    let testToken: string;
    let testUsername: string;
    let testUserId: string;

    beforeAll(async () => {
      const sessionTimestamp = Date.now();
      testUsername = `sessionuser${sessionTimestamp}`;

      const userData = {
        username: testUsername,
        email: `session${sessionTimestamp}@example.com`,
        password: "testpass123",
        name: "Session Test User",
      };

      const createdUser = await authService.createUser(userData);
      testUserId = createdUser.id;
    });

    it("should create session", () => {
      const user = authService.findUserByUsername(testUsername);
      expect(user).toBeDefined();
      expect(user?.id).toBe(testUserId);

      if (user) {
        userRepo.setEmailVerified(user.id, true);
      }

      const sessionResult = authService.createSession(
        user?.id ?? "",
        "127.0.0.1"
      );
      expect(sessionResult).toBeDefined();
      expect(sessionResult.token).toBeDefined();
      expect(typeof sessionResult.token).toBe("string");

      testToken = sessionResult.token;
    });

    it("should validate session by token", () => {
      const sessionData = authService.getSessionByToken(testToken);
      expect(sessionData).toBeDefined();
      expect(sessionData?.session.token).toBe(testToken);
      expect(sessionData?.user.username).toBe(testUsername);
      expect(sessionData?.user.id).toBe(testUserId);
    });

    it("should check if token is valid (lightweight)", () => {
      const isValid = authService.isValidToken(testToken);
      expect(isValid).toBe(true);
    });

    it("should validate session (alias function)", () => {
      const sessionData = authService.getSessionByToken(testToken);
      expect(sessionData).toBeDefined();
      expect(sessionData?.session.token).toBe(testToken);
    });

    it("should return null for invalid token", () => {
      const sessionData = authService.getSessionByToken("invalid-token");
      expect(sessionData).toBeNull();
    });

    it("should return false for invalid token (lightweight)", () => {
      const isValid = authService.isValidToken("invalid-token");
      expect(isValid).toBe(false);
    });

    it("should invalidate session", () => {
      authService.invalidateSession(testToken);

      const isValid = authService.isValidToken(testToken);
      expect(isValid).toBe(false);

      const sessionData = authService.getSessionByToken(testToken);
      expect(sessionData).toBeNull();
    });
  });

  describe("Session Token Generation", () => {
    it("should generate unique tokens", () => {
      const token1 = authService.generateSessionToken();
      const token2 = authService.generateSessionToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(typeof token1).toBe("string");
      expect(typeof token2).toBe("string");
      expect(token1.length).toBeGreaterThan(0);
      expect(token2.length).toBeGreaterThan(0);
      expect(token1).not.toBe(token2);
    });
  });
});
