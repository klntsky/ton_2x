ALTER TABLE "user_notifications" RENAME COLUMN "address" TO "wallet";--> statement-breakpoint
ALTER TABLE "user_purchases" RENAME COLUMN "address" TO "wallet";--> statement-breakpoint
ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_address_wallets_address_fk";
--> statement-breakpoint
ALTER TABLE "user_purchases" DROP CONSTRAINT "user_purchases_address_wallets_address_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_wallet_wallets_address_fk" FOREIGN KEY ("wallet") REFERENCES "public"."wallets"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_purchases" ADD CONSTRAINT "user_purchases_wallet_wallets_address_fk" FOREIGN KEY ("wallet") REFERENCES "public"."wallets"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
