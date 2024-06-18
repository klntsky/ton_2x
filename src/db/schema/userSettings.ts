import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'
import { users } from '.'

export const userSettings = pgTable('user_settings', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  languageCode: varchar('language_code', { length: 2 }).notNull(),
})
