import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core'
import { tokens } from '.'

export const userNotifications = pgTable('user_notifications', {
  jettonId: serial('jetton_id').references(() => tokens.id, { onDelete: 'cascade' }),
  timestamp: integer('timestamp').notNull(),
  price: varchar('price', { length: 64 }).notNull(),
})
