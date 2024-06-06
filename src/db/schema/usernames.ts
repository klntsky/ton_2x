import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usernames = sqliteTable('usernames', {
    userId: integer('user_id').notNull(),
    address: text('address').notNull(),
  });
