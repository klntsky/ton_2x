CREATE TABLE IF NOT EXISTS "tokens" (
	"token" varchar(128) PRIMARY KEY NOT NULL,
	"wallet" varchar(128) NOT NULL,
	"ticker" varchar(16) NOT NULL,
	CONSTRAINT "wallet-token" UNIQUE("wallet","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_notifications" (
	"address" varchar(128) NOT NULL,
	"jetton" varchar(128) NOT NULL,
	"timestamp" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_purchases" (
	"address" varchar(128) NOT NULL,
	"jetton" varchar(128) NOT NULL,
	"timestamp" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_settings" (
	"user_id" integer NOT NULL,
	"language_code" varchar(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"timestamp" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"address" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "user_id-address" UNIQUE("user_id","address")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_wallet_wallets_address_fk" FOREIGN KEY ("wallet") REFERENCES "public"."wallets"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_address_wallets_address_fk" FOREIGN KEY ("address") REFERENCES "public"."wallets"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_jetton_tokens_token_fk" FOREIGN KEY ("jetton") REFERENCES "public"."tokens"("token") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_purchases" ADD CONSTRAINT "user_purchases_address_wallets_address_fk" FOREIGN KEY ("address") REFERENCES "public"."wallets"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_purchases" ADD CONSTRAINT "user_purchases_jetton_tokens_token_fk" FOREIGN KEY ("jetton") REFERENCES "public"."tokens"("token") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
