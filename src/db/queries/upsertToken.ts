import type { TDbConnection, TDbTransaction } from '../../types'
import { tokens } from '../schema'

export const upsertToken = (
  db: TDbConnection | TDbTransaction,
  values: typeof tokens.$inferInsert,
) => {
  return db.insert(tokens).values(values).onConflictDoNothing()
}
