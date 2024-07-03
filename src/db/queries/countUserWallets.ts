import { count, eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { wallets } from '../schema'

export const countUserWallets = (db: TDbConnection, userId: number) => {
  return db
    .select({
      count: count(),
    })
    .from(wallets)
    .where(eq(wallets.userId, userId))
}
