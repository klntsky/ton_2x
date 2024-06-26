import { pgTable, integer, varchar, bigint } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  username: varchar('username', { length: 32 }).notNull(),
  timestamp: integer('timestamp').notNull(),
})
