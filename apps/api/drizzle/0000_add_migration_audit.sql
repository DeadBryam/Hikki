ALTER TABLE `__migrations` ADD `name` text;
--> statement-breakpoint
CREATE INDEX `idx_migrations_name` ON `__migrations` (`name`);
