import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { MessageRepository } from "@/database/repositories/message-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import type { Message } from "@/types/thread";
import {
  createMessageRepository,
  createThreadRepository,
  createUserRepository,
} from "../helpers/di-factories";

describe("Message Repository", () => {
  let messageRepo: MessageRepository;
  let threadRepo: ThreadRepository;
  let userRepo: UserRepository;
  let testThreadId: string;
  let testUserId: string;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;

    userRepo = createUserRepository(db);
    threadRepo = createThreadRepository(db);
    messageRepo = createMessageRepository(db, threadRepo);

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

  it("should save message", () => {
    const messageData: Omit<Message, "id" | "created_at"> = {
      thread_id: testThreadId,
      role: "user",
      content: "Test message content",
      service: "test-service",
      summarized: false,
    };

    expect(() => messageRepo.saveMessage(messageData)).not.toThrow();
  });

  it("should save message and update count", () => {
    const initialCount = threadRepo.findById(testThreadId)?.message_count || 0;

    const messageData: Omit<Message, "id" | "created_at"> = {
      thread_id: testThreadId,
      role: "assistant",
      content: "Assistant response",
      summarized: false,
    };

    messageRepo.saveMessageAndUpdateCount(messageData, testThreadId);

    const updatedThread = threadRepo.findById(testThreadId);
    expect(updatedThread?.message_count).toBe(initialCount + 1);
  });

  it("should get all messages for thread", () => {
    const messages = messageRepo.getAllMessages(testThreadId);
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);

    for (const message of messages) {
      expect(message.thread_id).toBe(testThreadId);
      expect(message.role).toBeDefined();
      expect(message.content).toBeDefined();
    }
  });

  it("should get paginated messages", () => {
    for (let i = 0; i < 5; i++) {
      messageRepo.saveMessage({
        thread_id: testThreadId,
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i + 1}`,
        summarized: false,
      });
    }

    const paginatedMessages = messageRepo.getPaginatedMessages(
      testThreadId,
      2,
      0
    );
    expect(Array.isArray(paginatedMessages)).toBe(true);
    expect(paginatedMessages.length).toBe(2);

    const nextPage = messageRepo.getPaginatedMessages(testThreadId, 2, 2);
    expect(nextPage.length).toBe(2);
  });

  it("should get not summarized messages", () => {
    messageRepo.saveMessage({
      thread_id: testThreadId,
      role: "user",
      content: "Summarized message",
      summarized: true,
    });

    messageRepo.saveMessage({
      thread_id: testThreadId,
      role: "assistant",
      content: "Not summarized message",
      summarized: false,
    });

    const notSummarized = messageRepo.getNotSummarizedMessages(testThreadId);
    expect(Array.isArray(notSummarized)).toBe(true);

    const hasSummarized = notSummarized.some(
      (m) => m.content === "Summarized message"
    );
    expect(hasSummarized).toBe(false);

    const hasNotSummarized = notSummarized.some(
      (m) => m.content === "Not summarized message"
    );
    expect(hasNotSummarized).toBe(true);
  });
});
