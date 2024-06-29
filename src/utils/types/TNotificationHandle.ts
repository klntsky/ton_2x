import type { tokens, userNotifications, userPurchases, users, wallets } from '../../db/schema'

export type TNotificationHandle = {
  rates: {
    top: number
    bottom: number
  }
  getUsersInDb: () => Promise<(typeof users.$inferSelect)[]>
  getPrice: (jetton: string) => Promise<number | undefined>
  getWalletsInDb: (userId: number) => Promise<(typeof wallets.$inferSelect)[]>
  getJettonsFromDB: (wallet: string) => Promise<(typeof tokens.$inferSelect)[]>
  getJettonsFromChain: (wallet: string) => Promise<
  {
    address: string
    symbol: string
    decimals: number
  }[]
  >
  getLastAddressJettonPurchaseFromDB: (
    address: string,
    jetton: string,
  ) => Promise<typeof userPurchases.$inferSelect | undefined>
  getLastAddressNotificationFromDB: (
    user: string,
    jetton: string,
  ) => Promise<typeof userNotifications.$inferSelect | undefined>
  deleteUserJetton: (user: string, jetton: string) => Promise<void>
}
