import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { swaps } from "./swaps";

export const notifications = sqliteTable('notifications', {
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull(),
    swap_id: text('swap_id').notNull().references(() => swaps.uuid),
    side: integer('side', { mode: 'boolean' }).notNull(),  // true for 'above', false for 'below'
    address: text('address').notNull(),
  });
  