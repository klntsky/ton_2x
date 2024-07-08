import { and, eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { tokens } from '../schema'

export const selectTokenByAddressAndWalletId = (
  db: TDbConnection,
  address: string,
  walletId: number,
) => {
  return db
    .select()
    .from(tokens)
    .where(and(eq(tokens.token, address), eq(tokens.walletId, walletId)))
}
