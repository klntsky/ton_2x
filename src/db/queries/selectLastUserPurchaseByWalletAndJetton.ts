import { desc, eq } from 'drizzle-orm'
import { userPurchases } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectLastUserPurchaseByWalletAndJetton = async (
  db: TDbConnection,
  jettonId: number,
) => {
  const [lastPurchase] = await db
    .select()
    .from(userPurchases)
    .where(eq(userPurchases.jettonId, jettonId))
    .orderBy(desc(userPurchases.timestamp))
    .limit(1)

  return lastPurchase
}
