import { asc, eq } from 'drizzle-orm'
import { userPurchases } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectFirstUserPurchaseByJettonId = async (db: TDbConnection, jettonId: number) => {
  const [firstPurchase] = await db
    .select()
    .from(userPurchases)
    .where(eq(userPurchases.jettonId, jettonId))
    .orderBy(asc(userPurchases.timestamp))
    .limit(1)

  return firstPurchase
}
