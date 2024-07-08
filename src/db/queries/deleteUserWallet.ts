import { and, eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { wallets } from '../schema'

export const deleteUserWallet = (db: TDbConnection, userId: number, walletId: number) => {
  return db
    .delete(wallets)
    .where(and(eq(wallets.userId, userId), eq(wallets.id, walletId)))
    .returning()
}
