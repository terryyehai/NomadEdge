CREATE TABLE `trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`location_name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`photo_key` text NOT NULL,
	`user_note` text,
	`ai_vibe` text,
	`created_at` integer DEFAULT (unixepoch())
);
