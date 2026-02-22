ALTER TABLE `threads` ADD COLUMN `archived_at` text;
--> statement-breakpoint
ALTER TABLE `threads` ADD COLUMN `is_pinned` integer DEFAULT 0 NOT NULL;