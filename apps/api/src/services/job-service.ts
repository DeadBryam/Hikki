import { JOB_CONSTANTS } from "@/config/constants";
import { logger } from "@/config/logger";
import type { JobRepository } from "@/database/repositories/job-repository";
import type { SessionRepository } from "@/database/repositories/session-repository";
import type { VerificationTokenRepository } from "@/database/repositories/verification-token-repository";
import type { Job } from "@/types/job";
import type JobHandlerService from "./job-handler-service";

/**
 * Dependencies required by the JobService
 */
interface JobServiceDeps {
  jobHandlerService: JobHandlerService;
  jobRepository: JobRepository;
  sessionRepository: SessionRepository;
  verificationTokenRepository: VerificationTokenRepository;
}

/**
 * Service for managing background jobs, including scheduling, processing, and cleanup
 */
export default class JobService {
  private readonly jobRepository: JobRepository;
  private readonly jobHandlerService: JobHandlerService;
  private readonly verificationTokenRepository: VerificationTokenRepository;
  private readonly sessionRepository: SessionRepository;

  /**
   * Creates a new JobService instance
   * @param deps - The dependencies required by the service
   */
  constructor({
    jobRepository,
    jobHandlerService,
    verificationTokenRepository,
    sessionRepository,
  }: JobServiceDeps) {
    this.jobRepository = jobRepository;
    this.jobHandlerService = jobHandlerService;
    this.verificationTokenRepository = verificationTokenRepository;
    this.sessionRepository = sessionRepository;
  }

  /**
   * Formats a delay in milliseconds to an execute_at string
   * @param delayMs - The delay in milliseconds
   * @returns The formatted execution time string
   */
  private formatExecuteAt(delayMs: number): string {
    return new Date(Date.now() + delayMs)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  }

  /**
   * Schedules a title generation job for a thread
   * @param threadId - The ID of the thread to generate a title for
   */
  scheduleTitleGeneration(threadId: string): void {
    const executeAt = this.formatExecuteAt(
      JOB_CONSTANTS.TITLE_GENERATION_DELAY
    );
    this.jobRepository.create({
      type: "generate-title",
      status: "pending",
      data: JSON.stringify({ threadId }),
      execute_at: executeAt,
    });
  }

  /**
   * Processes all pending jobs in the queue
   */
  async processJobs(): Promise<void> {
    const jobs = this.jobRepository.findPendingJobs();

    for (const job of jobs) {
      this.jobRepository.markAsProcessing(job.id);

      try {
        if (job.type === "generate-title") {
          await this.jobHandlerService.handleGenerateTitle({
            ...JSON.parse(job.data),
            jobId: job.id,
          });
        }

        this.jobRepository.markAsCompleted(job.id);

        this.handleRecurrentJob(job);

        if (job.recurrent) {
          this.jobRepository.incrementCurrentRuns(job.id);
        }

        logger.info(
          `Job ${job.id} (${job.type}) processed successfully with service: ${job.service || "N/A"}`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const retryCount = this.jobRepository.getRetryCount(job.id);

        if (this.shouldRetryJob(error, retryCount)) {
          await this.scheduleJobRetry(job, retryCount, errorMessage);
        } else {
          logger.error(
            `Job ${job.id} failed permanently after ${retryCount} retries: ${errorMessage}`
          );
          this.jobRepository.markAsFailed(job.id, errorMessage);
        }
      }
    }
  }

  /**
   * Handles scheduling the next run of a recurrent job if applicable
   * @param job - The completed job to check for recurrence
   */
  private handleRecurrentJob(job: Job): void {
    if (job.recurrent && job.interval_ms) {
      const currentRuns = (job.current_runs || 0) + 1;
      const canRunAgain = !job.max_runs || currentRuns < job.max_runs;

      if (canRunAgain) {
        const nextExecuteAt = this.formatExecuteAt(job.interval_ms);

        this.jobRepository.create({
          type: job.type,
          status: "pending",
          data: job.data,
          execute_at: nextExecuteAt,
          recurrent: true,
          interval_ms: job.interval_ms,
          max_runs: job.max_runs,
          current_runs: currentRuns,
        });
      } else {
        logger.info(
          `Recurrent job ${job.id} has reached its maximum runs (${job.max_runs}). No further scheduling.`
        );
      }
    }
  }

  /**
   * Determines if a failed job should be retried based on error type and retry count
   * @param error - The error that caused the job failure
   * @param retryCount - The current number of retry attempts
   * @returns True if the job should be retried, false otherwise
   */
  private shouldRetryJob(error: unknown, retryCount: number): boolean {
    if (retryCount >= JOB_CONSTANTS.MAX_RETRY_ATTEMPTS) {
      return false;
    }

    const errorMessage =
      error instanceof Error ? error.message.toLowerCase() : "";
    const transientErrors = [
      "timeout",
      "network",
      "connection",
      "rate limit",
      "service unavailable",
      "temporary failure",
      "internal server error",
    ];

    return transientErrors.some((keyword) => errorMessage.includes(keyword));
  }

  /**
   * Schedules a retry for a failed job with exponential backoff
   * @param job - The failed job to retry
   * @param currentRetryCount - The current number of retry attempts
   * @param errorMessage - The error message from the failure
   */
  private scheduleJobRetry(
    job: any,
    currentRetryCount: number,
    errorMessage: string
  ): void {
    this.jobRepository.incrementRetryCount(job.id);

    const delayMs =
      JOB_CONSTANTS.RETRY_BASE_DELAY *
      JOB_CONSTANTS.RETRY_BACKOFF_MULTIPLIER ** currentRetryCount;
    const executeAt = this.formatExecuteAt(delayMs);

    this.jobRepository.updateJob(job.id, {
      status: "pending",
      execute_at: executeAt,
    });

    logger.warn(
      `Job ${job.id} (${job.type}) failed (attempt ${currentRetryCount + 1}/${JOB_CONSTANTS.MAX_RETRY_ATTEMPTS + 1}): ${errorMessage}. Retrying in ${Math.round(delayMs / 1000)}s`
    );
  }

  /**
   * Performs cleanup of expired/old data across the system
   * - Verification tokens (email/password reset)
   * - Expired sessions
   * - Expired pending jobs (never executed, older than 24 hours)
   * - Stuck jobs in processing state for more than 2 hours
   * Note: Completed jobs are kept for audit/debugging purposes
   */
  async performCleanup(): Promise<void> {
    logger.info("Starting cleanup of expired data...");

    try {
      await this.verificationTokenRepository.deleteExpired();
      logger.info("✓ Expired verification tokens cleaned");

      const expiredSessions = this.sessionRepository.deleteExpired(Date.now());
      logger.info(`✓ Cleaned ${expiredSessions} expired sessions`);

      const expiredPending = this.jobRepository.deleteExpiredPendingJobs(
        JOB_CONSTANTS.EXPIRED_TOKEN_AGE
      );
      if (expiredPending > 0) {
        logger.info(`✓ Cleaned ${expiredPending} expired pending jobs`);
      }

      const stuckJobs = this.jobRepository.deleteStuckJobs(
        JOB_CONSTANTS.STUCK_JOB_TIMEOUT
      );
      if (stuckJobs > 0) {
        logger.warn(`✓ Cleaned ${stuckJobs} stuck jobs in processing state`);
      }

      logger.info("Cleanup completed successfully");
    } catch (error) {
      logger.error(
        `Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Updates the service associated with a job
   * @param jobId - The ID of the job to update
   * @param service - The service name to associate with the job
   */
  updateJobService(jobId: string, service: string): void {
    this.jobRepository.updateJobService(jobId, service);
  }

  /**
   * Schedules a recurrent job with dynamic interval and optional max runs
   * @param type - The type of the job
   * @param data - Additional data for the job
   * @param intervalMs - The interval between job runs in milliseconds
   * @param maxRuns - Maximum number of times the job should run (null for unlimited)
   * @param executeAt - Optional specific execution time (defaults to intervalMs from now)
   */
  scheduleRecurrentJob(
    type: string,
    data: Record<string, any>,
    intervalMs: number,
    maxRuns: number | null = null,
    executeAt?: string
  ): void {
    const execAt = executeAt || this.formatExecuteAt(intervalMs);
    this.jobRepository.create({
      type,
      status: "pending",
      data: JSON.stringify(data),
      execute_at: execAt,
      recurrent: true,
      interval_ms: intervalMs,
      max_runs: maxRuns,
      current_runs: 0,
    });
  }
}
