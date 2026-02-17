import type { AwilixContainer } from "awilix";
import { asClass, asValue, createContainer, InjectionMode } from "awilix";
import { db } from "@/database/connection";
import { JobRepository } from "@/database/repositories/job-repository";
import { MemoryRepository } from "@/database/repositories/memory-repository";
import { MessageRepository } from "@/database/repositories/message-repository";
import { SessionRepository } from "@/database/repositories/session-repository";
import { SummaryRepository } from "@/database/repositories/summary-repository";
import { ThreadRepository } from "@/database/repositories/thread-repository";
import { UserRepository } from "@/database/repositories/user-repository";
import { VerificationTokenRepository } from "@/database/repositories/verification-token-repository";
import AuthService from "@/services/auth";
import { EmailService } from "@/services/email-service";
import JobHandlerService from "@/services/job-handler-service";
import JobService from "@/services/job-service";
import LLMService from "@/services/llm-service";
import ThreadService from "@/services/thread-service";
import type { ContainerCradle } from "@/types/container";

let containerInstance: AwilixContainer<ContainerCradle> | null = null;

/**
 * Creates and configures the dependency injection container.
 * Uses awilix for IoC (Inversion of Control).
 *
 * Benefits of DI:
 * - Loose coupling between components
 * - Easier testing (mock dependencies)
 * - Clear dependency graph
 * - Lifecycle management
 */
export function createDIContainer() {
  const newContainer = createContainer<ContainerCradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  newContainer.register({
    db: asValue(db),

    userRepository: asClass(UserRepository).singleton(),
    sessionRepository: asClass(SessionRepository).singleton(),
    summaryRepository: asClass(SummaryRepository).singleton(),
    memoryRepository: asClass(MemoryRepository).singleton(),
    jobRepository: asClass(JobRepository).singleton(),
    threadRepository: asClass(ThreadRepository).singleton(),
    messageRepository: asClass(MessageRepository).singleton(),
    verificationTokenRepository: asClass(
      VerificationTokenRepository
    ).singleton(),

    authService: asClass(AuthService).singleton(),
    threadService: asClass(ThreadService).singleton(),
    llmService: asClass(LLMService).singleton(),
    jobHandlerService: asClass(JobHandlerService).singleton(),
    jobService: asClass(JobService).singleton(),
    emailService: asClass(EmailService).singleton(),
  });

  return newContainer;
}

/**
 * Gets the singleton container instance, creating it if needed.
 * This lazy initialization helps avoid issues with test environments.
 */
export function getContainer(): AwilixContainer<ContainerCradle> {
  if (!containerInstance) {
    containerInstance = createDIContainer();
  }
  return containerInstance;
}

/**
 * Resets the container (useful for testing).
 * Forces recreation of all singletons on next access.
 */
export function resetContainer(): void {
  if (containerInstance) {
    containerInstance.dispose();
    containerInstance = null;
  }
}

export const container = {
  resolve: <K extends keyof ContainerCradle>(key: K): ContainerCradle[K] =>
    getContainer().resolve(key),
};

export const resolve = <K extends keyof ContainerCradle>(
  key: K
): ContainerCradle[K] => getContainer().resolve(key);

/**
 * Helper to create a scoped container for request-level dependencies.
 * Useful for per-request isolation in the future.
 */
export function createScope() {
  return getContainer().createScope();
}
