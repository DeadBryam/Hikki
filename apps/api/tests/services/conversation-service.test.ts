import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { MessageRepository } from "@/database/repositories/message-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import type ThreadService from "@/services/thread-service";
import {
  createJobHandlerService,
  createJobRepository,
  createJobService,
  createLLMService,
  createMessageRepository,
  createSessionRepository,
  createThreadRepository,
  createThreadService,
  createUserRepository,
  createVerificationTokenRepository,
} from "../helpers/di-factories";

describe("Conversation Service", () => {
  let threadService: ThreadService;
  let userRepo: UserRepository;
  let threadRepo: ThreadRepository;
  let messageRepo: MessageRepository;
  let testUserId: string;
  let testThreadId: string;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;

    userRepo = createUserRepository(db);
    threadRepo = createThreadRepository(db);
    messageRepo = createMessageRepository(db, threadRepo);
    const jobRepo = createJobRepository(db);
    const verificationTokenRepo = createVerificationTokenRepository(db);
    const sessionRepo = createSessionRepository(db);
    const llmService = createLLMService();
    const jobHandlerService = createJobHandlerService(
      jobRepo,
      messageRepo,
      threadRepo,
      llmService
    );
    const jobService = createJobService(
      jobRepo,
      jobHandlerService,
      verificationTokenRepo,
      sessionRepo
    );
    threadService = createThreadService(messageRepo, threadRepo, jobService);

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
  });

  it("should get thread messages with system message", () => {
    const messages = threadService.getThreadMessages(testThreadId, testUserId);

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);

    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("helpful assistant");

    const thread = threadRepo.findById(testThreadId);
    expect(thread).toBeDefined();
    expect(thread?.user_id).toBe(testUserId);
  });

  it("should store user message in thread", () => {
    const initialCount = threadRepo.findById(testThreadId)?.message_count || 0;

    threadService.storeUserMessageInThread(
      testThreadId,
      "Hello, this is a test message",
      "test-service"
    );

    const updatedThread = threadRepo.findById(testThreadId);
    expect(updatedThread?.message_count).toBe(initialCount + 1);

    const messages = messageRepo.getAllMessages(testThreadId);
    const userMessage = messages.find(
      (m) => m.content === "Hello, this is a test message"
    );
    expect(userMessage).toBeDefined();
    expect(userMessage?.role).toBe("user");
    expect(userMessage?.service).toBe("test-service");
  });

  it("should store assistant response in thread", () => {
    const initialCount = threadRepo.findById(testThreadId)?.message_count || 0;

    threadService.storeAssistantResponseInThread(
      testThreadId,
      "Hello! How can I help you today?",
      "test-service"
    );

    const updatedThread = threadRepo.findById(testThreadId);
    expect(updatedThread?.message_count).toBe(initialCount + 1);

    const messages = messageRepo.getAllMessages(testThreadId);
    const assistantMessage = messages.find(
      (m) => m.content === "Hello! How can I help you today?"
    );
    expect(assistantMessage).toBeDefined();
    expect(assistantMessage?.role).toBe("assistant");
    expect(assistantMessage?.service).toBe("test-service");
  });

  it("should get threads with pagination", () => {
    for (let i = 0; i < 3; i++) {
      const threadId = `pagination-thread-${Date.now()}-${i}`;
      threadRepo.create({
        id: threadId,
        user_id: testUserId,
        title: `Pagination Thread ${i}`,
        message_count: 0,
      });
    }

    const result = threadService.getThreads({
      userId: testUserId,
      limit: 2,
      offset: 0,
    });

    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("pagination");
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBe(2);
    expect(result.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: expect.any(Number),
      totalPages: expect.any(Number),
      hasNext: expect.any(Boolean),
      hasPrev: expect.any(Boolean),
    });

    for (const thread of result.items) {
      expect(thread.user_id).toBe(testUserId);
    }
  });

  it("should filter threads by search term", () => {
    const searchThreadId = `search-thread-${Date.now()}`;
    threadRepo.create({
      id: searchThreadId,
      user_id: testUserId,
      title: "Special Search Thread",
      message_count: 1,
    });

    const regularThreadId = `regular-thread-${Date.now()}`;
    threadRepo.create({
      id: regularThreadId,
      user_id: testUserId,
      title: "Regular Thread",
      message_count: 1,
    });

    const searchResult = threadService.getThreads({
      userId: testUserId,
      limit: 10,
      offset: 0,
      search: "Special",
    });

    expect(searchResult.items.length).toBe(1);
    expect(searchResult.items[0].id).toBe(searchThreadId);
    expect(searchResult.items[0].title).toBe("Special Search Thread");
  });

  it("should sort threads by different criteria", () => {
    const threadIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const threadId = `sort-thread-${Date.now()}-${i}`;
      threadIds.push(threadId);
      threadRepo.create({
        id: threadId,
        user_id: testUserId,
        title: `Thread ${i}`,
        message_count: 1,
      });
    }

    const resultTitleAsc = threadService.getThreads({
      userId: testUserId,
      limit: 10,
      offset: 0,
      sortBy: "title",
      sortOrder: "asc",
    });

    expect(resultTitleAsc.items.length).toBeGreaterThanOrEqual(3);

    for (let i = 1; i < resultTitleAsc.items.length; i++) {
      const prevTitle = resultTitleAsc.items[i - 1].title || "";
      const currTitle = resultTitleAsc.items[i].title || "";
      expect(prevTitle.localeCompare(currTitle)).toBeLessThanOrEqual(0);
    }

    const resultTitleDesc = threadService.getThreads({
      userId: testUserId,
      limit: 10,
      offset: 0,
      sortBy: "title",
      sortOrder: "desc",
    });

    expect(resultTitleDesc.items.length).toBeGreaterThanOrEqual(3);

    for (let i = 1; i < resultTitleDesc.items.length; i++) {
      const prevTitle = resultTitleDesc.items[i - 1].title || "";
      const currTitle = resultTitleDesc.items[i].title || "";
      expect(prevTitle.localeCompare(currTitle)).toBeGreaterThanOrEqual(0);
    }
  });

  it("should get messages with pagination", () => {
    for (let i = 0; i < 5; i++) {
      messageRepo.saveMessage({
        thread_id: testThreadId,
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Paginated message ${i + 1}`,
        summarized: false,
      });
    }

    const paginatedMessages = threadService.getMessages({
      threadId: testThreadId,
      userId: testUserId,
      limit: 3,
      offset: 0,
    });

    expect(Array.isArray(paginatedMessages)).toBe(true);
    expect(paginatedMessages?.length).toBe(3);

    for (const message of paginatedMessages || []) {
      expect(message.role).toBeDefined();
      expect(message.content).toBeDefined();
    }
  });

  it("should archive conversation", () => {
    const archiveThreadId = `archive-thread-${Date.now()}`;
    threadRepo.create({
      id: archiveThreadId,
      user_id: testUserId,
      title: "Thread to Archive",
      message_count: 0,
    });

    threadService.archiveConversation(archiveThreadId, testUserId);

    const archivedThread = threadRepo.findById(archiveThreadId);
    expect(archivedThread?.deleted_at).toBeDefined();
  });

  it("should return only not summarized messages in thread messages", () => {
    const summarizedThreadId = `summarized-thread-${Date.now()}`;
    threadRepo.create({
      id: summarizedThreadId,
      user_id: testUserId,
      title: "Summarized Thread",
      message_count: 0,
    });

    messageRepo.saveMessage({
      thread_id: summarizedThreadId,
      role: "user",
      content: "This message is summarized",
      summarized: true,
    });

    messageRepo.saveMessage({
      thread_id: summarizedThreadId,
      role: "assistant",
      content: "This message is not summarized",
      summarized: false,
    });

    const threadMessages = threadService.getThreadMessages(
      summarizedThreadId,
      testUserId
    );

    expect(threadMessages.length).toBe(2);
    expect(threadMessages[0].role).toBe("system");
    expect(threadMessages[1].content).toBe("This message is not summarized");
  });
});
