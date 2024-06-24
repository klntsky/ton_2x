import { ENotificationType } from '../constants'
import type { TNotificationHandle } from './types'
import type { TNotification } from './types/TNotifications'

export async function* getNotifications(
  handle: TNotificationHandle,
): AsyncGenerator<TNotification> {
  const {
    getLastAddressJettonPurchaseFromDB,
    getLastAddressNotificationFromDB,
    getJettonsFromChain,
    getJettonsFromDB,
    getWalletsInDb,
    getUsersInDb,
    getPrice,
  } = handle
  for (const user of await getUsersInDb()) {
    for (const wallet of await getWalletsInDb(user.id)) {
      const addressJettonsFromChain = await getJettonsFromChain(wallet.address)
      const addressJettonsFromChainObj = addressJettonsFromChain.reduce<
      Record<string, (typeof addressJettonsFromChain)[number]>
      >((obj, jetton) => {
          obj[jetton.address] = jetton
          return obj
        }, {})
      const addressJettonsFromDb = await getJettonsFromDB(wallet.address)
      for (const jetton of addressJettonsFromDb) {
        if (!addressJettonsFromChainObj[jetton.token]) {
          yield {
            userId: user.id,
            wallet: wallet.address,
            jetton: jetton.token,
            symbol: jetton.ticker,
            action: ENotificationType.NOT_HOLD_JETTON_ANYMORE,
          }
          continue
        }
        delete addressJettonsFromChainObj[jetton.token]
        const tokenOnChain = await getPrice(jetton.token)
        if (!tokenOnChain) {
          continue
        }
        const lastPurchase = await getLastAddressJettonPurchaseFromDB(wallet.address, jetton.token)
        const lastNotification = await getLastAddressNotificationFromDB(
          wallet.address,
          jetton.token,
        )
        const newestTransactionInDb =
          lastPurchase && lastNotification
            ? lastPurchase.timestamp > lastNotification.timestamp
              ? lastPurchase
              : lastNotification
            : lastPurchase || lastNotification
        if (!newestTransactionInDb) {
          continue
        }
        if (tokenOnChain.timestamp <= newestTransactionInDb.timestamp) {
          continue
        }
        const rate = tokenOnChain.price / newestTransactionInDb.price
        const rateDirection =
          rate >= 2 ? ENotificationType.UP : rate <= 0.5 ? ENotificationType.DOWN : undefined
        if (!rateDirection) {
          continue
        }
        yield {
          userId: user.id,
          wallet: wallet.address,
          jetton: jetton.token,
          symbol: jetton.ticker,
          price: tokenOnChain.price,
          action: rateDirection,
          timestamp: tokenOnChain.timestamp,
        }
      }
      for (const [address, { symbol }] of Object.entries(addressJettonsFromChainObj)) {
        const tokenOnChain = await getPrice(address)
        if (!tokenOnChain) {
          continue
        }
        yield {
          userId: user.id,
          wallet: wallet.address,
          jetton: address,
          symbol: symbol,
          price: tokenOnChain.price,
          timestamp: tokenOnChain.timestamp,
          action: ENotificationType.NEW_JETTON,
        }
      }
    }
  }
}
