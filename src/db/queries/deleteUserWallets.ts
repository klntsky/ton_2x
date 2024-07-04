import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { wallets } from '../schema'

export const deleteUserWallets = (db: TDbConnection, userId: number) => {
  return db.delete(wallets).where(eq(wallets.userId, userId))
}
