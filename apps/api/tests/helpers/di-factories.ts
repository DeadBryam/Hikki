/**
 * Test utilities for dependency injection.
 *
 * This module provides factory functions to create repository and service
 * instances for testing purposes. Use these instead of direct instantiation
 * to ensure compatibility with the DI container patterns.
 */

import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { JobRepository } from "@/database/repositories/job-repository";
import { MemoryRepository } from "@/database/repositories/memory-repository";
import { MessageRepository } from "@/database/repositories/message-repository";
import { SessionRepository } from "@/database/repositories/session-repository";
import { SummaryRepository } from "@/database/repositories/summary-repository";
import { ThreadRepository } from "@/database/repositories/thread-repository";
import { UserRepository } from "@/database/repositories/user-repository";
import { VerificationTokenRepository } from "@/database/repositories/verification-token-repository";
import type * as schema from "@/database/schema";
import AuthService from "@/services/auth";
import JobHandlerService from "@/services/job-handler-service";
import JobService from "@/services/job-service";
import LLMService from "@/services/llm-service";
import ThreadService from "@/services/thread-service";

type DrizzleDB = BunSQLiteDatabase<typeof schema>;

export const createUserRepository = (db: DrizzleDB) =>
  new UserRepository({ db });

export const createSessionRepository = (db: DrizzleDB) =>
  new SessionRepository({ db });

export const createSummaryRepository = (db: DrizzleDB) =>
  new SummaryRepository({ db });

export const createMemoryRepository = (db: DrizzleDB) =>
  new MemoryRepository({ db });

export const createJobRepository = (db: DrizzleDB) => new JobRepository({ db });

export const createVerificationTokenRepository = (db: DrizzleDB) =>
  new VerificationTokenRepository({ db });

export const createThreadRepository = (db: DrizzleDB) =>
  new ThreadRepository({ db });

export const createLLMService = () => new LLMService();

export const createMessageRepository = (
  db: DrizzleDB,
  threadRepository: ThreadRepository
) => new MessageRepository({ db, threadRepository });

export const createAuthService = (
  userRepository: UserRepository,
  sessionRepository: SessionRepository
) => new AuthService({ userRepository, sessionRepository });

export const createThreadService = (
  messageRepository: MessageRepository,
  threadRepository: ThreadRepository,
  jobService: JobService
) => new ThreadService({ messageRepository, threadRepository, jobService });

export const createJobHandlerService = (
  jobRepository: JobRepository,
  messageRepository: MessageRepository,
  threadRepository: ThreadRepository,
  llmService: LLMService
) =>
  new JobHandlerService({
    jobRepository,
    messageRepository,
    threadRepository,
    llmService,
  });

export const createJobService = (
  jobRepository: JobRepository,
  jobHandlerService: JobHandlerService,
  verificationTokenRepository: VerificationTokenRepository,
  sessionRepository: SessionRepository
) =>
  new JobService({
    jobRepository,
    jobHandlerService,
    verificationTokenRepository,
    sessionRepository,
  });

/**
 * Creates a complete set of test dependencies.
 * Useful for integration tests that need the full dependency graph.
 */
export function createTestDependencies(db: DrizzleDB) {
  const userRepository = createUserRepository(db);
  const sessionRepository = createSessionRepository(db);
  const summaryRepository = createSummaryRepository(db);
  const memoryRepository = createMemoryRepository(db);
  const jobRepository = createJobRepository(db);
  const verificationTokenRepository = createVerificationTokenRepository(db);
  const threadRepository = createThreadRepository(db);
  const messageRepository = createMessageRepository(db, threadRepository);
  const llmService = createLLMService();
  const jobHandlerService = createJobHandlerService(
    jobRepository,
    messageRepository,
    threadRepository,
    llmService
  );
  const jobService = createJobService(
    jobRepository,
    jobHandlerService,
    verificationTokenRepository,
    sessionRepository
  );

  const authService = createAuthService(userRepository, sessionRepository);
  const threadService = createThreadService(
    messageRepository,
    threadRepository,
    jobService
  );

  return {
    db,
    userRepository,
    sessionRepository,
    summaryRepository,
    memoryRepository,
    jobRepository,
    verificationTokenRepository,
    threadRepository,
    messageRepository,
    authService,
    threadService,
    jobHandlerService,
    jobService,
  };
}
