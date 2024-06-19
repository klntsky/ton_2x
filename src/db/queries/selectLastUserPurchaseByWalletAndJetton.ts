import { and, desc, eq } from 'drizzle-orm'
import { userPurchases } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectLastUserPurchaseByWalletAndJetton = async (
  db: TDbConnection,
  wallet: string,
  jetton: string,
): Promise<typeof userPurchases.$inferSelect | undefined> => {
  const [lastNotification] = await db
    .select()
    .from(userPurchases)
    .where(and(eq(userPurchases.wallet, wallet), eq(userPurchases.jetton, jetton)))
    .orderBy(desc(userPurchases.timestamp))
    .limit(1)

  return lastNotification
}
