import type { tokens, userNotifications, userPurchases, users, wallets } from '../../../db/schema'

export type TNotificationHandle = {
  rates: {
    top: number
    bottom: number
  }
  getUsersInDb: () => Promise<(typeof users.$inferSelect)[]>
  getPrice: (jetton: string) => Promise<number | undefined>
  getWalletsInDb: (userId: number) => Promise<(typeof wallets.$inferSelect)[]>
  getJettonsFromDB: (walletId: number) => Promise<(typeof tokens.$inferSelect)[]>
  getJettonsFromChain: (wallet: string) => Promise<
  {
    address: string
    symbol: string
    decimals: number
  }[]
  >
  getLastAddressJettonPurchaseFromDB: (
    jettonId: number,
  ) => Promise<typeof userPurchases.$inferSelect | undefined>
  getLastAddressNotificationFromDB: (
    jettonId: number,
  ) => Promise<typeof userNotifications.$inferSelect | undefined>
}
