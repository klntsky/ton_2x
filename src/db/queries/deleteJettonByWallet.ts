import { and, eq } from 'drizzle-orm'
import type { TDbConnection } from '../../types'
import { tokens } from '../schema'

export const deleteJettonByWallet = async (db: TDbConnection, jetton: string, wallet: string) => {
  await db.delete(tokens).where(and(eq(tokens.wallet, wallet), eq(tokens.token, jetton)))
}
