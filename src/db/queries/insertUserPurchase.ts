import type { TDbConnection } from '../../types'
import { userPurchases } from '../schema'

export const insertUserPurchase = async (
  db: TDbConnection,
  values: typeof userPurchases.$inferInsert,
) => {
  await db.insert(userPurchases).values(values)
}
