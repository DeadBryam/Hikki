-- Create reminders table for one-time and recurrent notifications
CREATE TABLE `reminders` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `message` text NOT NULL,
  `type` text NOT NULL CHECK (`type` IN ('one-time', 'recurrent')),
  `schedule_at` text NOT NULL,
  `repeat_pattern` text,
  `channel` text NOT NULL CHECK (`channel` IN ('in-app', 'email', 'push', 'all')),
  `status` text NOT NULL DEFAULT ('active') CHECK (`status` IN ('active', 'completed', 'cancelled')),
  `triggered_at` text,
  `job_id` text REFERENCES `jobs`(`id`) ON DELETE SET NULL,
  `created_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Indexes for efficient querying
CREATE INDEX `idx_reminders_user_id` ON `reminders` (`user_id`);
CREATE INDEX `idx_reminders_status` ON `reminders` (`status`);
CREATE INDEX `idx_reminders_schedule_at` ON `reminders` (`schedule_at`);
