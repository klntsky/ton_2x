import { usernames } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectUsernamesByAddress = async (db: TDbConnection, address: string) => {
  return await db.select().from(usernames)
}
