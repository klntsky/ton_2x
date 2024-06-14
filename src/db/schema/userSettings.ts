import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usernames } from ".";

export const userSettings = sqliteTable('user_settings', {
    userId: integer('user_id').notNull().references(() => usernames.userId, { onDelete: 'cascade' }),
    languageCode: text('language_code').notNull(),
});
