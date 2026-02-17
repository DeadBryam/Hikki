ALTER TABLE `jobs` ADD `recurrent` integer DEFAULT false;
--> statement-breakpoint
ALTER TABLE `jobs` ADD `interval_ms` integer;
--> statement-breakpoint
ALTER TABLE `jobs` ADD `max_runs` integer;
--> statement-breakpoint
ALTER TABLE `jobs` ADD `current_runs` integer DEFAULT 0;