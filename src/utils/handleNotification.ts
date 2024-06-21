import type { Telegraf } from 'telegraf'
import { getJettonsByAddress, getNotifications } from '.'
import { tokens, users, wallets } from '../db/schema'
import { getDbConnection } from './getDbConnection'
import type { TTelegrafContext } from '../types'
import { eq } from 'drizzle-orm'
import { getTraceIdsByAddress, getTracesByTxHash } from './parseTxData'
import { i18n } from '../i18n'
import {
  deleteJettonByWallet,
  insertUserNotification,
  insertUserPurchase,
  selectLastUserNotificationByWalletAndJetton,
  selectLastUserPurchaseByWalletAndJetton,
  selectUserSettings,
  upsertToken,
} from '../db/queries'
import { ENotificationType } from '../constants'
import type { TNotificationHandle } from './types'

type JettonAddress = string

// A jetton that exists on some wallet
type WalletJetton = {
  amount: number
}

export async function* getUsers(handle: {
  getUsersInDb: () => Promise<(typeof users.$inferSelect)[]>
}) {
  const { getUsersInDb } = handle
  const usersInDb = await getUsersInDb()
  for (const user of usersInDb) {
    yield user
  }
}

export const handleNotification = async (bot: Telegraf<TTelegrafContext>) => {
  const db = await getDbConnection()
  const handle: TNotificationHandle = {
    getPrice: async (jetton: JettonAddress) => {
      const [trace] = await getTraceIdsByAddress(jetton, 1)
      if (!trace) {
        return undefined
      }
      const txTrace = await getTracesByTxHash(trace.id)
      const price = txTrace.transaction.out_msgs[0]?.value
      if (!price) {
        return undefined
      }
      return {
        price,
        timestamp: txTrace.transaction.utime,
      }
    },
    getUsersInDb: () => db.select().from(users),
    getWalletsInDb: userId => db.select().from(wallets).where(eq(wallets.userId, userId)),
    getJettonsFromDB: wallet => db.select().from(tokens).where(eq(tokens.wallet, wallet)),
    getJettonsFromChain: getJettonsByAddress,
    getLastAddressJettonPurchaseFromDB: (address: string, jetton: string) =>
      selectLastUserPurchaseByWalletAndJetton(db, address, jetton),
    getLastAddressNotificationFromDB: (address: string, jetton: string) =>
      selectLastUserNotificationByWalletAndJetton(db, address, jetton),
    deleteUserJetton: (user: string, jetton: string) => deleteJettonByWallet(db, jetton, user),
  }
  for await (const notification of getNotifications(handle)) {
    const userSettings = await selectUserSettings(db, notification.userId)
    if (notification.action === ENotificationType.NEW_JETTON) {
      await upsertToken(db, {
        token: notification.jetton,
        wallet: notification.wallet,
        ticker: notification.symbol,
      })
      await insertUserPurchase(db, {
        wallet: notification.wallet,
        timestamp: notification.timestamp,
        jetton: notification.jetton,
        price: notification.price,
      })
      await bot.telegram.sendMessage(
        notification.userId,
        i18n(userSettings?.languageCode).message.detectedNewJetton(notification.symbol),
      )
      continue
    }
    if (notification.action === ENotificationType.NOT_HOLD_JETTON_ANYMORE) {
      await db.delete(tokens).where(eq(tokens.token, notification.jetton))
      await bot.telegram.sendMessage(
        notification.userId,
        i18n(userSettings?.languageCode).message.youNoLongerHaveJetton(notification.symbol),
      )
      continue
    }
    const text =
      notification.action === ENotificationType.UP
        ? i18n(userSettings?.languageCode).message.notification.x2(
          notification.symbol,
          notification.wallet,
        )
        : i18n(userSettings?.languageCode).message.notification.x05(
          notification.symbol,
          notification.wallet,
        )
    await bot.telegram.sendMessage(notification.userId, text)
    await insertUserNotification(db, {
      timestamp: notification.timestamp,
      price: notification.price,
      wallet: notification.wallet,
      jetton: notification.jetton,
    })
  }
}

// export const handleNotifications = async (bot: Telegraf<TTelegrafContext>) => {
//   const db = await getDbConnection()
//   const walletsInDb = await db.select().from(wallets)
//   for (const user of walletsInDb) {
//     const [userLanguageCode] = await db
//       .select()
//       .from(userSettings)
//       .where(eq(userSettings.userId, user.userId))
//     const languageCode = userLanguageCode && userLanguageCode.languageCode === 'ru' ? 'ru' : 'en'
//     const jettonsActual = await getJettonsByAddress(user.address)
//     const jettonsActualObj = jettonsActual.reduce<Record<string, (typeof jettonsActual)[number]>>(
//       (obj, jetton) => {
//         obj[jetton.address] = jetton
//         return obj
//       },
//     {},
//     )
//     const jettonsInDb = await db.select().from(tokens).where(eq(tokens.wallet, user.address))
//     for (const jetton of jettonsInDb) {
//       if (!jettonsActualObj[jetton.token]) {
//         await db.delete(tokens).where(eq(tokens.token, jetton.token))
//         await bot.telegram.sendMessage(
//           user.userId,
//           i18n(languageCode).message.youNoLongerHaveJetton(jetton.ticker),
//         )
//         continue
//       }
//       const [trace] = await getTraceIdsByAddress(jetton.token, 1)
//       const txTrace = await getTracesByTxHash(trace.id)
//       const value = txTrace.transaction.out_msgs[0].value
//       const [lastPurchase] = await db
//         .select()
//         .from(userPurchases)
//         .where(eq(userPurchases.jetton, jetton.token))
//         .orderBy(desc(userPurchases.timestamp))
//         .limit(1)
//       const [lastNotification] = await db
//         .select()
//         .from(userNotifications)
//         .where(eq(userPurchases.jetton, jetton.token))
//         .orderBy(desc(userPurchases.timestamp))
//         .limit(1)
//       const newestTransaction =
//         lastPurchase.timestamp > lastNotification.timestamp ? lastPurchase : lastNotification
//       if (txTrace.transaction.utime > newestTransaction.timestamp) {
//         const rate = value / newestTransaction.price
//         if (rate >= 2) {
//           await bot.telegram.sendMessage(
//             user.userId,
//             i18n(languageCode).message.notification.x2(jetton.ticker, user.address),
//           )
//         } else if (rate <= 0.5) {
//           await bot.telegram.sendMessage(
//             user.userId,
//             i18n(languageCode).message.notification.x05(jetton.ticker, user.address),
//           )
//         }
//         await db.insert(userNotifications).values({
//           timestamp: txTrace.transaction.utime,
//           price: value,
//           wallet: user.address,
//           jetton: jetton.token,
//         })
//       }
//       await db.insert(userPurchases).values({
//         timestamp: txTrace.transaction.utime,
//         price: value,
//         wallet: user.address,
//         jetton: jetton.token,
//       })
//       delete jettonsActualObj[jetton.token]
//     }
//     for (const [address, { symbol }] of Object.entries(jettonsActualObj)) {
//       await db.insert(tokens).values({
//         wallet: user.address,
//         token: address,
//         ticker: symbol,
//       })
//     }
//   }
// }
