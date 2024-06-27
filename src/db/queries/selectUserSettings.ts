import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { userSettings } from '../schema'

export const selectUserSettings = async (db: TDbConnection, userId: number) => {
  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId))
  return settings
}
