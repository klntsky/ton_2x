DELETE FROM "user_notifications";--> statement-breakpoint
DELETE FROM "user_purchases";--> statement-breakpoint
DELETE FROM "tokens";--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "decimals" integer NOT NULL;