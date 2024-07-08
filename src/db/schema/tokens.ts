import { pgTable, serial, unique, varchar } from 'drizzle-orm/pg-core'
import { wallets } from '.'

export const tokens = pgTable(
  'tokens',
  {
    id: serial('id').primaryKey(),
    token: varchar('token', { length: 128 }).notNull(),
    walletId: serial('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }),
    ticker: varchar('ticker', { length: 16 }).notNull(),
  },
  table => ({
    unique: unique('wallet_id-token_id').on(table.walletId, table.token),
  }),
)
