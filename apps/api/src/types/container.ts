import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { JobRepository } from "@/database/repositories/job-repository";
import type { MemoryRepository } from "@/database/repositories/memory-repository";
import type { MessageRepository } from "@/database/repositories/message-repository";
import type { SessionRepository } from "@/database/repositories/session-repository";
import type { SummaryRepository } from "@/database/repositories/summary-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import type { VerificationTokenRepository } from "@/database/repositories/verification-token-repository";
import type * as schema from "@/database/schema";
import type AuthService from "@/services/auth";
import type { EmailService } from "@/services/email-service";
import type JobHandlerService from "@/services/job-handler-service";
import type JobService from "@/services/job-service";
import type LLMService from "@/services/llm-service";
import type ThreadService from "@/services/thread-service";

/**
 * Dependency Injection Container Interface
 * Defines all registered dependencies and their types
 */
export interface ContainerCradle {
  authService: AuthService;

  db: BunSQLiteDatabase<typeof schema>;
  emailService: EmailService;
  jobHandlerService: JobHandlerService;
  jobRepository: JobRepository;
  jobService: JobService;
  llmService: LLMService;
  memoryRepository: MemoryRepository;
  messageRepository: MessageRepository;
  sessionRepository: SessionRepository;
  summaryRepository: SummaryRepository;
  threadRepository: ThreadRepository;
  threadService: ThreadService;

  userRepository: UserRepository;
  verificationTokenRepository: VerificationTokenRepository;
}

/**
 * Type helper for resolving dependencies from the container
 */
export type Resolve<K extends keyof ContainerCradle> = ContainerCradle[K];
