import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const swaps = sqliteTable('swaps', {
  address: text('address').notNull(),
  pair: text('pair').notNull(),
  direction: text('direction', { enum: ['forward', 'back'] }).notNull(),
  amountA: blob('amount_a', { mode: 'bigint' }).notNull(),
  amountB: blob('amount_b', { mode: 'bigint' }).notNull(),
  timestamp: text('timestamp').notNull(),
  uuid: text('uuid').primaryKey().notNull(),
});
