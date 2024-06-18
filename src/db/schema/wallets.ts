import { integer, pgTable, unique, varchar } from 'drizzle-orm/pg-core'
import { users } from '.'

export const wallets = pgTable(
  'wallets',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    address: varchar('address', { length: 128 }).notNull(),
  },
  table => ({
    unique: unique('user_id-address').on(table.userId, table.address),
  }),
)
