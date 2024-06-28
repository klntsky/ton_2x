DELETE FROM "user_notifications";--> statement-breakpoint
DELETE FROM "user_purchases";--> statement-breakpoint
ALTER TABLE "user_notifications" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "user_purchases" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "user_notifications" ADD COLUMN "price" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "user_purchases" ADD COLUMN "price" numeric NOT NULL;