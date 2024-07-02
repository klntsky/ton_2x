import { and, eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { tokens } from '../schema'

export const deleteJettonByWallet = async (
  db: TDbConnection,
  jettonId: number,
  walletId: number,
) => {
  await db.delete(tokens).where(and(eq(tokens.walletId, walletId), eq(tokens.id, jettonId)))
}
