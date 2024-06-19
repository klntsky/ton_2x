import type { Telegraf } from 'telegraf'
import { getJettonsByAddress } from '.'
import { tokens, userPurchases, userSettings, wallets } from '../db/schema'
import { getDbConnection } from './getDbConnection'
import type { TTelegrafContext } from '../types'
import { desc, eq } from 'drizzle-orm'
import { getTraceIdsByAddress, getTracesByTxHash } from './parseTxData'
import { userNotifications } from '../db/schema/userNotifications'
import { i18n } from '../i18n'

// type UserAddress = string;
// type UserId = number;
// type JettonAddress = string

// type DBNotification = {
//   user: UserId,
//   address: UserAddress,
//   timestamp: number,
//   jetton: JettonAddress
// };

// type DBPurchase = typeof userPurchases.$inferSelect

// type User = {
//   id: UserId,
//   languageCode: string;
// };

// // A jetton that exists on some wallet
// type WalletJetton = {
//   amount: number;
// };

// type NotificationHandle = {
//   getPrice: (jetton: JettonAddress) => Promise<number | undefined>,
//   users: AsyncIterableIterator<{
//     address: UserAddress,
//     jettons: WalletJetton[],
//     users: User[],
//   }>,
//   getJettonsFromChain: (user: UserAddress) => Promise<{
//     address: JettonAddress,
//     symbol?: string
//   }[]>,
//   // selectLastUserPurchaseByWalletAndJetton.ts
//   getLastAddressJettonPurchaseFromDB: (
//     address: UserAddress,
//     jetton: JettonAddress
//   ) => Promise<DBPurchase | null>,
//   // selectLastUserNotificationByWalletAndJetton.ts
//   getLastAddressNotificationFromDB: (
//     user: UserAddress,
//     jetton: JettonAddress
//   ) => Promise<DBNotification | null>,
//   // deleteJettonByWallet.ts
//   deleteUserJetton: (
//     user: UserAddress,
//     jetton: JettonAddress
//   ) => Promise<void>,
// };

// type Notification = object

// export async function* getNotifications(handle: NotificationHandle): AsyncGenerator<Notification> {
//   const { getLastPurchase, getLastNotification, getJettonsFromChain } = handle
//   for await (const user of handle.users) {
//     const addressJettons = await getJettonsFromChain(user.address)
//     for (const jetton of addressJettons) {
//       const lastPurchase = await getLastPurchase(user.address, jetton.address)
//       const lastNotification = await getLastNotification(user.address, jetton.address)
//       // TODO: this yield just to shut linter
//       yield {}
//     }
//   }
// };

export const handleNotifications = async (bot: Telegraf<TTelegrafContext>) => {
  const db = await getDbConnection()
  const walletsInDb = await db.select().from(wallets)
  for (const user of walletsInDb) {
    const [userLanguageCode] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.userId))
    const languageCode = userLanguageCode && userLanguageCode.languageCode === 'ru' ? 'ru' : 'en'
    const jettonsActual = await getJettonsByAddress(user.address)
    const jettonsActualObj = jettonsActual.reduce<Record<string, (typeof jettonsActual)[number]>>(
      (obj, jetton) => {
        obj[jetton.address] = jetton
        return obj
      },
    {},
    )
    const jettonsInDb = await db.select().from(tokens).where(eq(tokens.wallet, user.address))
    for (const jetton of jettonsInDb) {
      if (!jettonsActualObj[jetton.token]) {
        await db.delete(tokens).where(eq(tokens.token, jetton.token))
        await bot.telegram.sendMessage(
          user.userId,
          i18n[languageCode].message.youNoLongerHaveJetton(jetton.ticker),
        )
        continue
      }
      const [trace] = await getTraceIdsByAddress(jetton.token, 1)
      const txTrace = await getTracesByTxHash(trace.id)
      const value = txTrace.transaction.out_msgs[0].value
      const [lastPurchase] = await db
        .select()
        .from(userPurchases)
        .where(eq(userPurchases.jetton, jetton.token))
        .orderBy(desc(userPurchases.timestamp))
        .limit(1)
      const [lastNotification] = await db
        .select()
        .from(userNotifications)
        .where(eq(userPurchases.jetton, jetton.token))
        .orderBy(desc(userPurchases.timestamp))
        .limit(1)
      const newestTransaction =
        lastPurchase.timestamp > lastNotification.timestamp ? lastPurchase : lastNotification
      if (txTrace.transaction.utime > newestTransaction.timestamp) {
        const rate = value / newestTransaction.price
        if (rate >= 2) {
          await bot.telegram.sendMessage(
            user.userId,
            i18n[languageCode].message.notification.x2(jetton.ticker, rate, user.address),
          )
        } else if (rate <= 0.5) {
          await bot.telegram.sendMessage(
            user.userId,
            i18n[languageCode].message.notification.x05(jetton.ticker, rate, user.address),
          )
        }
        await db.insert(userNotifications).values({
          timestamp: txTrace.transaction.utime,
          price: value,
          wallet: user.address,
          jetton: jetton.token,
        })
      }
      await db.insert(userPurchases).values({
        timestamp: txTrace.transaction.utime,
        price: value,
        wallet: user.address,
        jetton: jetton.token,
      })
      delete jettonsActualObj[jetton.token]
    }
    for (const [address, { symbol }] of Object.entries(jettonsActualObj)) {
      await db.insert(tokens).values({
        wallet: user.address,
        token: address,
        ticker: symbol,
      })
    }
  }
}
