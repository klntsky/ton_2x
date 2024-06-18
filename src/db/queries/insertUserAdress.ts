import { wallets } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const insertUserAdress = async (db: TDbConnection, values: typeof wallets.$inferInsert) => {
  await db.insert(wallets).values(values).onConflictDoNothing()
}
