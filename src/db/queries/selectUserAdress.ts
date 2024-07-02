import { and, eq } from 'drizzle-orm'
import { wallets } from '../../db/schema'
import type { TDbConnection } from '../../types'

export const selectUserAdress = (db: TDbConnection, address: string, userId: number) => {
  return db
    .select()
    .from(wallets)
    .where(and(eq(wallets.address, address), eq(wallets.userId, userId)))
}
