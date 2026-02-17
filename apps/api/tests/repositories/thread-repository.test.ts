import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import {
  createThreadRepository,
  createUserRepository,
} from "../helpers/di-factories";

describe("Thread Repository", () => {
  let threadRepo: ThreadRepository;
  let userRepo: UserRepository;
  let testUserId: string;
  let testThreadId: string;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;

    userRepo = createUserRepository(db);
    threadRepo = createThreadRepository(db);

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
      title: "Test Thread",
      message_count: 0,
    });
  });

  it("should create a thread", () => {
    const newThreadId = `new-thread-${Date.now()}`;
    threadRepo.create({
      id: newThreadId,
      user_id: testUserId,
      title: "New Test Thread",
      message_count: 0,
    });

    const thread = threadRepo.findById(newThreadId);
    expect(thread).toBeDefined();
    expect(thread?.title).toBe("New Test Thread");
    expect(thread?.user_id).toBe(testUserId);
  });

  it("should find thread by id", () => {
    const thread = threadRepo.findById(testThreadId);
    expect(thread).toBeDefined();
    expect(thread?.id).toBe(testThreadId);
    expect(thread?.user_id).toBe(testUserId);
    expect(thread?.title).toBe("Test Thread");
  });

  it("should return null for non-existent thread", () => {
    const thread = threadRepo.findById("non-existent-thread");
    expect(thread).toBeNull();
  });

  it("should get threads by user id", () => {
    const userThreads = threadRepo.getThreadsByUserId(testUserId);
    expect(Array.isArray(userThreads)).toBe(true);
    expect(userThreads.length).toBeGreaterThan(0);

    for (const thread of userThreads) {
      expect(thread.user_id).toBe(testUserId);
      expect(thread.deleted_at).toBeNull();
    }
  });

  it("should get paginated threads by user id", () => {
    for (let i = 0; i < 3; i++) {
      const threadId = `pagination-thread-${Date.now()}-${i}`;
      threadRepo.create({
        id: threadId,
        user_id: testUserId,
        title: `Pagination Thread ${i}`,
        message_count: 0,
      });
    }

    const paginatedThreads = threadRepo.getThreadsPaginatedByUserId(
      testUserId,
      2,
      0
    );
    expect(Array.isArray(paginatedThreads)).toBe(true);
    expect(paginatedThreads.length).toBe(2);

    const nextPage = threadRepo.getThreadsPaginatedByUserId(testUserId, 2, 2);
    expect(nextPage.length).toBeGreaterThan(0);
  });

  it("should update message count", () => {
    const initialThread = threadRepo.findById(testThreadId);
    const initialCount = initialThread?.message_count || 0;

    threadRepo.updateMessageCount(testThreadId);

    const updatedThread = threadRepo.findById(testThreadId);
    expect(updatedThread?.message_count).toBe(initialCount + 1);
  });

  it("should update thread title", () => {
    threadRepo.updateTitle(testThreadId, "Updated Thread Title");

    const updatedThread = threadRepo.findById(testThreadId);
    expect(updatedThread?.title).toBe("Updated Thread Title");
  });

  it("should archive thread", () => {
    const archiveThreadId = `archive-thread-${Date.now()}`;
    threadRepo.create({
      id: archiveThreadId,
      user_id: testUserId,
      title: "Thread to Archive",
      message_count: 0,
    });

    threadRepo.archiveThread(archiveThreadId);

    const archivedThread = threadRepo.findById(archiveThreadId);
    expect(archivedThread?.deleted_at).toBeDefined();

    const userThreads = threadRepo.getThreadsByUserId(testUserId);
    const archivedInList = userThreads.find((t) => t.id === archiveThreadId);
    expect(archivedInList).toBeUndefined();
  });

  it("should initialize thread", () => {
    const newThreadId = `init-thread-${Date.now()}`;
    const { thread: initializedThread } = threadRepo.initializeThread(
      newThreadId,
      testUserId
    );

    expect(initializedThread).toBeDefined();
    expect(initializedThread?.id).toBe(newThreadId);
    expect(initializedThread?.user_id).toBe(testUserId);
    expect(initializedThread?.message_count).toBe(0);
  });

  it("should get all threads", () => {
    const allThreads = threadRepo.getAll();
    expect(Array.isArray(allThreads)).toBe(true);
    expect(allThreads.length).toBeGreaterThan(0);
  });
});
