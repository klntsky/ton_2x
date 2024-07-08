import { wallets } from '../../db/schema'
import type { TDbConnection, TDbTransaction } from '../../types'

export const insertUserAdress = (
  db: TDbConnection | TDbTransaction,
  values: typeof wallets.$inferInsert,
) => {
  return db.insert(wallets).values(values).onConflictDoNothing().returning()
}
