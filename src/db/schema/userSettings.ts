import { bigint, pgTable, varchar } from 'drizzle-orm/pg-core'
import { users } from '.'

export const userSettings = pgTable('user_settings', {
  userId: bigint('user_id', { mode: 'number' })
    .references(() => users.id, {
      onDelete: 'cascade',
    })
    .primaryKey(),
  languageCode: varchar('language_code', { length: 2 }).notNull(),
})
