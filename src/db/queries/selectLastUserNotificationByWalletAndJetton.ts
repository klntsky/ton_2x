import { and, desc, eq } from 'drizzle-orm'
import { userNotifications } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectLastUserNotificationByWalletAndJetton = async (
  db: TDbConnection,
  wallet: string,
  jetton: string,
) => {
  const [lastNotification] = await db
    .select()
    .from(userNotifications)
    .where(and(eq(userNotifications.wallet, wallet), eq(userNotifications.jetton, jetton)))
    .orderBy(desc(userNotifications.timestamp))
    .limit(1)

  return lastNotification
}
