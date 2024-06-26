import { bigint, integer, pgTable, unique, varchar } from 'drizzle-orm/pg-core'
import { users } from '.'

export const wallets = pgTable(
  'wallets',
  {
    address: varchar('address', { length: 128 }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  table => ({
    unique: unique('user_id-address').on(table.userId, table.address),
  }),
)
