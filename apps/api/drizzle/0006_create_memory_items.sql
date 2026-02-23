CREATE TABLE `memory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text,
	`type` text NOT NULL CHECK (type IN ('fact', 'preference', 'context', 'personality', 'event', 'other')),
	`importance` integer NOT NULL CHECK (importance >= 1 AND importance <= 20),
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
