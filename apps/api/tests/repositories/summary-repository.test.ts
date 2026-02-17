import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { SummaryRepository } from "@/database/repositories/summary-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import type { Summary } from "@/types/thread";
import {
  createSummaryRepository,
  createThreadRepository,
  createUserRepository,
} from "../helpers/di-factories";

describe("Summary Repository", () => {
  let summaryRepo: SummaryRepository;
  let threadRepo: ThreadRepository;
  let userRepo: UserRepository;
  let testThreadId: string;
  let testUserId: string;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;

    userRepo = createUserRepository(db);
    threadRepo = createThreadRepository(db);
    summaryRepo = createSummaryRepository(db);

    const timestamp = Date.now();
    testUserId = `test-user-${timestamp}`;

    const userData = {
      id: testUserId,
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      name: "Test User",
      password: "hashedpassword",
      deleted_at: null,
      validated_at: null,
    };
    userRepo.create(userData);

    testThreadId = `test-thread-${timestamp}`;
    threadRepo.create({
      id: testThreadId,
      user_id: testUserId,
      title: "Test Thread for Summary",
      message_count: 0,
    });
  });

  it("should save summary", () => {
    const summaryData: Omit<Summary, "id" | "created_at" | "updated_at"> = {
      thread_id: testThreadId,
      summary: "This is a test summary of the conversation.",
    };

    expect(() => summaryRepo.saveSummary(summaryData)).not.toThrow();
  });

  it("should get summary for thread", () => {
    const summary = summaryRepo.getSummary(testThreadId);
    expect(summary).toBeDefined();
    expect(summary?.thread_id).toBe(testThreadId);
    expect(summary?.summary).toBe(
      "This is a test summary of the conversation."
    );
    expect(summary?.id).toBeDefined();
    expect(summary?.created_at).toBeDefined();
    expect(summary?.updated_at).toBeDefined();
  });

  it("should update existing summary", () => {
    const updatedSummary: Omit<Summary, "id" | "created_at" | "updated_at"> = {
      thread_id: testThreadId,
      summary: "Updated summary with new information.",
    };

    summaryRepo.saveSummary(updatedSummary);

    const retrievedSummary = summaryRepo.getSummary(testThreadId);
    expect(retrievedSummary?.summary).toBe(
      "Updated summary with new information."
    );
  });

  it("should return null for non-existent summary", () => {
    const nonExistentSummary = summaryRepo.getSummary("non-existent-thread-id");
    expect(nonExistentSummary).toBeNull();
  });

  it("should handle multiple threads with summaries", () => {
    const anotherThreadId = `another-thread-${Date.now()}`;
    threadRepo.create({
      id: anotherThreadId,
      user_id: testUserId,
      title: "Another Test Thread",
      message_count: 0,
    });

    const anotherSummary: Omit<Summary, "id" | "created_at" | "updated_at"> = {
      thread_id: anotherThreadId,
      summary: "Summary for another thread.",
    };

    summaryRepo.saveSummary(anotherSummary);

    const firstSummary = summaryRepo.getSummary(testThreadId);
    const secondSummary = summaryRepo.getSummary(anotherThreadId);

    expect(firstSummary?.summary).toBe("Updated summary with new information.");
    expect(secondSummary?.summary).toBe("Summary for another thread.");
    expect(firstSummary?.thread_id).toBe(testThreadId);
    expect(secondSummary?.thread_id).toBe(anotherThreadId);
  });
});
