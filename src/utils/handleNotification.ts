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

export const handleNotification = async (bot: Telegraf<TTelegrafContext>) => {
  const db = await getDbConnection()
  const handle: TNotificationHandle = {
    rates: {
      top: Number(process.env.NOTIFICATION_RATE_UP),
      bottom: Number(process.env.NOTIFICATION_RATE_DOWN),
    },
    getPrice: async (jetton: string) => {
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
  await db.close()
}
