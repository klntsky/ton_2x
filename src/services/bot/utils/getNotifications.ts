import { ENotificationType } from '../constants'
import type { TNotificationHandle } from '../types'
import type { TNotification } from '../types/TNotifications'

export async function* getNotifications(
  handle: TNotificationHandle,
): AsyncGenerator<TNotification> {
  const {
    getFirstAddressJettonPurchaseFromDB,
    getLastAddressJettonPurchaseFromDB,
    getLastAddressNotificationFromDB,
    secondForPossibleRollback,
    getJettonsFromChain,
    getJettonsFromDB,
    getWalletsInDb,
    getUsersInDb,
    getPrice,
    rates,
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
      const addressJettonsFromDb = await getJettonsFromDB(wallet.id)
      for (const jetton of addressJettonsFromDb) {
        if (!addressJettonsFromChainObj[jetton.token]) {
          // const firstPurchase = await getFirstAddressJettonPurchaseFromDB(jetton.id)
          // const secondsFromPurchase = Date.now() / 1000 - firstPurchase.timestamp
          // if (secondsFromPurchase <= secondForPossibleRollback) {
          //   continue
          // }
          yield {
            userId: user.id,
            walletId: wallet.id,
            jettonId: jetton.id,
            symbol: jetton.ticker,
            action: ENotificationType.NOT_HOLD_JETTON_ANYMORE,
          }
          continue
        }
        const lastPurchase = await getLastAddressJettonPurchaseFromDB(jetton.id)
        const lastNotification = await getLastAddressNotificationFromDB(jetton.id)
        console.log({ lastPurchase, lastNotification })
        const newestTransactionInDb = lastNotification
          ? lastPurchase.timestamp > lastNotification.timestamp
            ? lastPurchase
            : lastNotification
          : lastPurchase
        const decimals = addressJettonsFromChainObj[jetton.token].decimals
        delete addressJettonsFromChainObj[jetton.token]
        const timestamp = Math.floor(Date.now() / 1000)
        const price = await getPrice(jetton.token)
        if (!price) {
          continue
        }
        const rate = price / Number(newestTransactionInDb.price)
        console.log({ rate, price })
        const rateDirection =
          rate >= rates.top
            ? ENotificationType.UP
            : rate <= rates.bottom
              ? ENotificationType.DOWN
              : undefined
        if (!rateDirection) {
          continue
        }
        yield {
          userId: user.id,
          walletId: wallet.id,
          jettonId: jetton.id,
          symbol: jetton.ticker,
          price: price,
          decimals,
          action: rateDirection,
          timestamp,
        }
      }
      for (const [address, { symbol, decimals }] of Object.entries(addressJettonsFromChainObj)) {
        const timestamp = Math.floor(Date.now() / 1000)
        const price = await getPrice(address)
        if (!price) {
          continue
        }
        yield {
          userId: user.id,
          walletId: wallet.id,
          jetton: address,
          symbol: symbol,
          price: price,
          timestamp,
          decimals: decimals,
          action: ENotificationType.NEW_JETTON,
        }
      }
    }
  }
}
