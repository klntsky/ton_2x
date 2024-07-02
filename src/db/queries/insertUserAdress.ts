import { wallets } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const insertUserAdress = (db: TDbConnection, values: typeof wallets.$inferInsert) => {
  return db.insert(wallets).values(values).onConflictDoNothing()
}
