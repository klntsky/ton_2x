import { bigint, pgTable, serial, unique, varchar } from 'drizzle-orm/pg-core'
import { users } from '.'

export const wallets = pgTable(
  'wallets',
  {
    id: serial('id').primaryKey(),
    address: varchar('address', { length: 128 }).notNull(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  table => ({
    pk: unique('user_id-address').on(table.userId, table.address),
  }),
)
