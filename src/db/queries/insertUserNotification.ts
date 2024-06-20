import type { TDbConnection } from '../../types'
import { userNotifications } from '../schema'

export const insertUserNotification = async (
  db: TDbConnection,
  values: typeof userNotifications.$inferInsert,
) => {
  await db.insert(userNotifications).values(values)
}
