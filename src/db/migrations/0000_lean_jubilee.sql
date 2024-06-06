CREATE TABLE `notifications` (
	`is_deleted` integer NOT NULL,
	`swap_id` text NOT NULL,
	`side` integer NOT NULL,
	`address` text NOT NULL,
	FOREIGN KEY (`swap_id`) REFERENCES `swaps`(`uuid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pairs` (
	`pair` text NOT NULL,
	`token_a` text NOT NULL,
	`token_b` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `swaps` (
	`address` text NOT NULL,
	`pair` text NOT NULL,
	`direction` text NOT NULL,
	`amount_a` blob NOT NULL,
	`amount_b` blob NOT NULL,
	`timestamp` text NOT NULL,
	`uuid` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`token` text,
	`ticker` text
);
--> statement-breakpoint
CREATE TABLE `usernames` (
	`user_id` integer NOT NULL,
	`address` text NOT NULL
);
