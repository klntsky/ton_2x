import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const userSettings = sqliteTable('user_settings', {
  userId: integer('user_id').notNull(),
  languageCode: text('language_code').notNull(),
})
