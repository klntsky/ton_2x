import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usernames } from "./usernames";

export const tokens = sqliteTable('tokens', {
  walletAddress: text('wallet_address').notNull().references(() => usernames.address),
  token: text('token').primaryKey(),
  ticker: text('ticker').notNull(),
});
