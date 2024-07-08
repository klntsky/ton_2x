CREATE TABLE IF NOT EXISTS "tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar(128) NOT NULL,
	"wallet_id" serial NOT NULL,
	"ticker" varchar(16) NOT NULL,
	CONSTRAINT "wallet_id-token_id" UNIQUE("wallet_id","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_notifications" (
	"jetton_id" serial NOT NULL,
	"timestamp" integer NOT NULL,
	"price" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_purchases" (
	"jetton_id" serial NOT NULL,
	"timestamp" integer NOT NULL,
	"price" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_settings" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"language_code" varchar(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"timestamp" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" varchar(128) NOT NULL,
	"user_id" bigint NOT NULL,
	CONSTRAINT "user_id-address" UNIQUE("user_id","address")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_jetton_id_tokens_id_fk" FOREIGN KEY ("jetton_id") REFERENCES "public"."tokens"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_purchases" ADD CONSTRAINT "user_purchases_jetton_id_tokens_id_fk" FOREIGN KEY ("jetton_id") REFERENCES "public"."tokens"("id") ON DELETE cascade ON UPDATE no action;
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
