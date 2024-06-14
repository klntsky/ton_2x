import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const tokens = sqliteTable(
  'tokens',
  {
    walletAddress: text('wallet_address').notNull(),
    token: text('token').primaryKey(),
    ticker: text('ticker').notNull(),
  },
  table => ({
    unique: unique('wallet_address-token').on(table.walletAddress, table.token),
  }),
)
