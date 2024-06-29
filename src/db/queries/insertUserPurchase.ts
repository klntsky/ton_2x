import type { TDbConnection } from '../../types'
import { userPurchases } from '../schema'

export const insertUserPurchase = (
  db: TDbConnection,
  values: typeof userPurchases.$inferInsert,
) => {
  return db.insert(userPurchases).values(values)
}
