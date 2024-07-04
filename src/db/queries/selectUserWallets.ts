import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { wallets } from '../schema'

export const selectUserWallets = (db: TDbConnection, userId: number) => {
  return db.select().from(wallets).where(eq(wallets.userId, userId))
}
