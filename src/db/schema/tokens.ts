import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tokens = sqliteTable('tokens', {
    token: text('token'),
    ticker: text('ticker'),
  });
