import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { MemoryRepository } from "@/database/repositories/memory-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import {
  createMemoryRepository,
  createThreadRepository,
  createUserRepository,
} from "../helpers/di-factories";

describe("Memory Repository", () => {
  let memoryRepo: MemoryRepository;
  let threadRepo: ThreadRepository;
  let userRepo: UserRepository;
  let testThreadId: string;
  let testUserId: string;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;

    userRepo = createUserRepository(db);
    threadRepo = createThreadRepository(db);
    memoryRepo = createMemoryRepository(db);

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
      title: "Test Thread for Memory",
      message_count: 0,
    });
  });

  it("should save memory item", () => {
    const memoryData = {
      userId: testUserId,
      thread_id: testThreadId,
      type: "fact" as const,
      content: "Test memory content",
    };

    expect(() => memoryRepo.saveMemoryItem(memoryData)).not.toThrow();
  });

  it("should get memory by type", () => {
    const memoryData = {
      userId: testUserId,
      thread_id: testThreadId,
      type: "personality" as const,
      content: "Test personality trait",
    };

    memoryRepo.saveMemoryItem(memoryData);

    const memories = memoryRepo.getMemoryByType(
      testUserId,
      testThreadId,
      "personality"
    );
    expect(Array.isArray(memories)).toBe(true);
    expect(memories.length).toBeGreaterThan(0);

    const personalityMemory = memories.find((m) => m.type === "personality");
    expect(personalityMemory).toBeDefined();
    expect(personalityMemory?.content).toBe("Test personality trait");
    expect(personalityMemory?.thread_id).toBe(testThreadId);
  });

  it("should get all memory for thread", () => {
    const threadMemories = memoryRepo.getMemoryByType(testUserId, testThreadId);
    expect(Array.isArray(threadMemories)).toBe(true);
    expect(threadMemories.length).toBeGreaterThan(0);

    for (const memory of threadMemories) {
      expect(memory.thread_id).toBe(testThreadId);
    }
  });

  it("should get memory by type only", () => {
    const factMemories = memoryRepo.getMemoryByType(
      testUserId,
      undefined,
      "fact"
    );
    expect(Array.isArray(factMemories)).toBe(true);

    for (const memory of factMemories) {
      expect(memory.type).toBe("fact");
    }
  });

  it("should get all memory items for user", () => {
    const allMemories = memoryRepo.getMemoryByType(testUserId);
    expect(Array.isArray(allMemories)).toBe(true);
    expect(allMemories.length).toBeGreaterThan(0);
  });

  it("should save memory item without thread_id", () => {
    const globalMemory = {
      userId: testUserId,
      type: "event" as const,
      content: "Global event memory",
    };

    expect(() => memoryRepo.saveMemoryItem(globalMemory)).not.toThrow();

    const eventMemories = memoryRepo.getMemoryByType(
      testUserId,
      undefined,
      "event"
    );
    expect(eventMemories.length).toBeGreaterThan(0);

    const globalEvent = eventMemories.find(
      (m) => m.content === "Global event memory"
    );
    expect(globalEvent).toBeDefined();
    expect(globalEvent?.thread_id).toBeNull();
  });
});
