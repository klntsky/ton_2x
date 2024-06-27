ALTER TABLE "user_settings" ALTER COLUMN "user_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "user_id" SET DATA TYPE bigint;