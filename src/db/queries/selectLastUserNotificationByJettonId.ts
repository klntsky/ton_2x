import { desc, eq } from 'drizzle-orm'
import { userNotifications } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectLastUserNotificationByJettonId = async (db: TDbConnection, jettonId: number) => {
  const [lastNotification] = await db
    .select()
    .from(userNotifications)
    .where(eq(userNotifications.jettonId, jettonId))
    .orderBy(desc(userNotifications.timestamp))
    .limit(1)

  return lastNotification
}
