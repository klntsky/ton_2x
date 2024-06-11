import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usernames } from ".";

export const userNotifications = sqliteTable('user_notifications', {
    userId: integer('user_id').notNull().references(() => usernames.userId),
    jetton: text('jetton').notNull(),
    timestamp: integer('timestamp').notNull(),
    price: integer('price').notNull(),
  });
