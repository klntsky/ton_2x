import { pairs } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectPairs = async (db: TDbConnection) => {
  return await db.select().from(pairs)
}
