import { integer, pgTable, unique, varchar } from 'drizzle-orm/pg-core'
import { wallets } from '.'

export const tokens = pgTable(
  'tokens',
  {
    token: varchar('token', { length: 128 }).primaryKey(),
    wallet: varchar('wallet', { length: 128 })
      .notNull()
      .references(() => wallets.address, { onDelete: 'cascade' }),
    ticker: varchar('ticker', { length: 16 }).notNull(),
    decimals: integer('decimals').notNull(),
  },
  table => ({
    unique: unique('wallet-token').on(table.wallet, table.token),
  }),
)
