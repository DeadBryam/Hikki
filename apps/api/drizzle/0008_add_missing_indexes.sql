CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_threads_user_id` ON `threads` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_jobs_status` ON `jobs` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_jobs_execute_at` ON `jobs` (`execute_at`);
--> statement-breakpoint
CREATE INDEX `idx_messages_thread_id` ON `messages` (`thread_id`);