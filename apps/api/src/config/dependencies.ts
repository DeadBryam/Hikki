/**
 * Dependency Injection exports using awilix container.
 *
 * This module provides resolved dependencies from the DI container.
 * All dependencies are automatically wired and managed by awilix.
 *
 * Benefits:
 * - Automatic dependency resolution
 * - Singleton lifecycle management
 * - Easy testing with mock dependencies
 * - Clear dependency graph
 */

// biome-ignore lint/performance/noBarrelFile: Container exports
export {
  container,
  createScope,
  resetContainer,
  resolve,
} from "./container";

import { resolve } from "./container";

export const userRepository = resolve("userRepository");
export const sessionRepository = resolve("sessionRepository");
export const summaryRepository = resolve("summaryRepository");
export const memoryRepository = resolve("memoryRepository");
export const threadRepository = resolve("threadRepository");
export const messageRepository = resolve("messageRepository");
export const jobRepository = resolve("jobRepository");
export const verificationTokenRepository = resolve(
  "verificationTokenRepository"
);

export const authService = resolve("authService");
export const threadService = resolve("threadService");
export const jobHandlerService = resolve("jobHandlerService");
export const jobService = resolve("jobService");
export const emailService = resolve("emailService");
