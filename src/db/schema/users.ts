import { pgTable, integer, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: integer('id').primaryKey(),
  username: varchar('username', { length: 32 }).notNull(),
  timestamp: integer('timestamp').notNull(),
})
