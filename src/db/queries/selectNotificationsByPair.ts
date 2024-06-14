import { notifications } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectNotificationsByPair = async (db: TDbConnection, pair: string) => {
  return await db.select().from(notifications)
}
