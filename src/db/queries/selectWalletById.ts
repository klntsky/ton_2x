import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { wallets } from '../schema'

export const selectWalletById = (db: TDbConnection, walletId: number) => {
  return db.select().from(wallets).where(eq(wallets.id, walletId))
}
