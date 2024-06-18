import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'
import { tokens, wallets } from '.'

export const userNotifications = pgTable('user_notifications', {
  walletId: varchar('address', { length: 128 })
    .notNull()
    .references(() => wallets.address, { onDelete: 'cascade' }),
  jetton: varchar('jetton', { length: 128 })
    .notNull()
    .references(() => tokens.token),
  timestamp: integer('timestamp').notNull(),
  price: integer('price').notNull(),
})
