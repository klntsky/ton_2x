import type { TDbConnection } from '../../types'
import { users } from '../schema'

export const upsertUser = (db: TDbConnection, values: typeof users.$inferInsert) => {
  return db.insert(users).values(values).onConflictDoNothing()
}
