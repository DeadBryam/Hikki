import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { UserRepository } from "@/database/repositories/user-repository";
import { users } from "@/database/schema";
import type { User } from "@/types/auth";
import { createUserRepository } from "../helpers/di-factories";

describe("User Repository", () => {
  let userRepo: UserRepository;
  let testUserId: string;
  let testUsername: string;
  let testEmail: string;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;
    userRepo = createUserRepository(db);

    db.delete(users).run();
  });

  beforeEach(() => {
    const timestamp = Date.now();
    const uniqueId = crypto.randomUUID();
    testUserId = `test-user-${timestamp}-${uniqueId}`;
    testUsername = `testuser${timestamp}${uniqueId}`;
    testEmail = `test${timestamp}${uniqueId}@example.com`;

    const userData: Omit<User, "created_at" | "updated_at"> = {
      id: testUserId,
      username: testUsername,
      email: testEmail,
      name: "Test User",
      password: "hashedpassword",
      deleted_at: null,
      validated_at: null,
    };

    userRepo.create(userData);
  });

  it("should find user by id", () => {
    const user = userRepo.findById(testUserId);
    expect(user).toBeDefined();
    expect(user?.username).toBe(testUsername);
    expect(user?.email).toBe(testEmail);
  });

  it("should find user by username", () => {
    const user = userRepo.findByUsername(testUsername);
    expect(user).toBeDefined();
    expect(user?.id).toBe(testUserId);
    expect(user?.email).toBe(testEmail);
  });

  it("should return null for non-existent user", () => {
    const user = userRepo.findById("definitely-non-existent-user-id-12345");
    expect(user).toBeNull();
  });

  it("should return null for non-existent username", () => {
    const user = userRepo.findByUsername(
      "definitely-non-existent-username-12345"
    );
    expect(user).toBeNull();
  });
});
