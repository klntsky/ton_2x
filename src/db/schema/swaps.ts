import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const swaps = sqliteTable('swaps', {
    uuid: int('uuid').primaryKey(),
    address: text('address'),
    pair: text('pair'),
    direction: text('direction', { enum: ['forward', 'back'] }),
    aAmount: int('aAmount'),
    bAmount: int('bAmount'),
    timestamp: text('timestamp'),
  });
