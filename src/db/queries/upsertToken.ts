import type { TDbConnection } from '../../types'
import { tokens } from '../schema'

export const upsertToken = (db: TDbConnection, values: typeof tokens.$inferInsert) => {
  return db.insert(tokens).values(values).onConflictDoNothing()
}
