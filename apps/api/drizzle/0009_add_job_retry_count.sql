ALTER TABLE `jobs` ADD `retry_count` integer DEFAULT 0;
--> statement-breakpoint
CREATE INDEX `idx_jobs_retry_count` ON `jobs` (`retry_count`);