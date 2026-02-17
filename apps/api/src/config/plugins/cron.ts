import { cron, Patterns } from "@elysiajs/cron";
import { jobService } from "../dependencies";

/**
 * Cron job plugin for processing background jobs
 */
export const processJobsCron: ReturnType<typeof cron> = cron({
  name: "process-jobs",
  pattern: Patterns.everySeconds(15),
  run: () => jobService.processJobs(),
});

/**
 * Cron job plugin for cleaning expired data
 * Runs every hour to clean:
 * - Expired verification tokens
 * - Expired sessions
 * - Old completed jobs (7+ days)
 * - Stuck processing jobs (2+ hours)
 */
export const cleanupCron: ReturnType<typeof cron> = cron({
  name: "cleanup-expired-data",
  pattern: Patterns.everyHours(1),
  run: () => jobService.performCleanup(),
});
