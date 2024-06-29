import type { Telegraf } from 'telegraf'
import { getJettonsByAddress, getNotifications } from '.'
import { tokens, userPurchases, users, wallets } from '../db/schema'
import { getDbConnection } from './getDbConnection'
import type { TTelegrafContext } from '../types'
import { eq } from 'drizzle-orm'
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
import { ENotificationType, tonApiClient } from '../constants'
import type { TNotificationHandle } from './types'

export const handleNotification = async (bot: Telegraf<TTelegrafContext>) => {
  const db = await getDbConnection()
  const handle: TNotificationHandle = {
    rates: {
      top: Number(process.env.NOTIFICATION_RATE_UP),
      bottom: Number(process.env.NOTIFICATION_RATE_DOWN),
    },
    getPrice: async (jetton: string) => {
      const { rates } = await tonApiClient.rates.getRates({
        tokens: [jetton],
        currencies: ['usd'],
      })
      const price = rates[jetton].prices?.['USD']
      return price
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
    console.log({ notification })
    const userSettings = await selectUserSettings(db, notification.userId)
    if (notification.action === ENotificationType.NEW_JETTON) {
      await upsertToken(db, {
        token: notification.jetton,
        wallet: notification.wallet,
        ticker: notification.symbol,
        decimals: notification.decimals,
      })
      console.log('new_tokken', notification.price.toString())
      await insertUserPurchase(db, {
        wallet: notification.wallet,
        timestamp: notification.timestamp,
        jetton: notification.jetton,
        price: notification.price.toString(),
      })
      console.log(await db.select().from(tokens))
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
    await bot.telegram.sendMessage(notification.userId, text, { parse_mode: 'Markdown' })
    console.log('rates', notification.price.toString())
    await insertUserNotification(db, {
      timestamp: notification.timestamp,
      price: notification.price.toString(),
      wallet: notification.wallet,
      jetton: notification.jetton,
    })
  }
  await db.close()
}
