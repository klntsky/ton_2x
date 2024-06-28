import type { TDbConnection } from '../../types'
import { tokens } from '../schema'

export const upsertToken = async (db: TDbConnection, values: typeof tokens.$inferInsert) => {
  await db
    .insert(tokens)
    .values(values)
    .onConflictDoUpdate({
      target: tokens.token,
      set: {
        decimals: values.decimals,
      },
    })
}
