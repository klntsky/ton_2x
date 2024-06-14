import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const usernames = sqliteTable('usernames', {
  userId: integer('user_id').notNull(),
  address: text('address').notNull(),
}, (table => ({
  unique: unique('user_id-address').on(table.userId, table.address),
})));
