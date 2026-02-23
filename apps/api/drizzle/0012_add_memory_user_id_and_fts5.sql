-- Migration: 0012_add_memory_user_id_and_fts5
-- Description: Add user_id to memory_items and create FTS5 virtual table for full-text search

-- Add user_id column to memory_items table
ALTER TABLE `memory_items` ADD COLUMN `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS `idx_memory_items_user_id` ON `memory_items`(`user_id`);

-- Create FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS `memory_items_fts` USING fts5(
  `id`,
  `content`,
  content=`memory_items`,
  content_rowid=`rowid`
);

-- Create trigger to keep FTS5 in sync on INSERT
CREATE TRIGGER IF NOT EXISTS `memory_items_ai` AFTER INSERT ON `memory_items` BEGIN
  INSERT INTO `memory_items_fts`(`id`, `content`) VALUES (new.id, new.content);
END;

-- Create trigger to keep FTS5 in sync on DELETE
CREATE TRIGGER IF NOT EXISTS `memory_items_ad` AFTER DELETE ON `memory_items` BEGIN
  DELETE FROM `memory_items_fts` WHERE `id` = old.id;
END;
