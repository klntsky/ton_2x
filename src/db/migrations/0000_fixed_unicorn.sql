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
	`wallet_address` text NOT NULL,
	`token` text PRIMARY KEY NOT NULL,
	`ticker` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_notifications` (
	`user_id` integer NOT NULL,
	`jetton` text NOT NULL,
	`timestamp` integer NOT NULL,
	`price` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `usernames`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_purchases` (
	`user_id` integer NOT NULL,
	`jetton` text NOT NULL,
	`timestamp` integer NOT NULL,
	`price` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `usernames`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `usernames` (
	`user_id` integer NOT NULL,
	`address` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_address-token` ON `tokens` (`wallet_address`,`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_id-address` ON `usernames` (`user_id`,`address`);