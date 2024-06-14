import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const pairs = sqliteTable('pairs', {
  pair: text('pair').notNull(),
  tokenA: text('token_a').notNull(),
  tokenB: text('token_b').notNull(),
})
