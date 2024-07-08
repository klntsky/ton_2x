import type { TDbConnection, TDbTransaction } from '../../types'
import { userPurchases } from '../schema'

export const insertUserPurchase = (
  db: TDbConnection | TDbTransaction,
  values: typeof userPurchases.$inferInsert,
) => {
  return db.insert(userPurchases).values(values)
}
