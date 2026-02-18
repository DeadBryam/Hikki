CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`status` text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
	`service` text,
	`reason` text,
	`execute_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`retry_count` integer DEFAULT 0,
	`recurrent` integer DEFAULT false,
	`interval_ms` integer,
	`max_runs` integer,
	`current_runs` integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `idx_jobs_retry_count` ON `jobs` (`retry_count`);
