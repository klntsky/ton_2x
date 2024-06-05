import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable('users', {
    telegramId: int('telegram_id'),
    address: text('address'),
  });
