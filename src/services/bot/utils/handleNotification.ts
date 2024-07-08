import type { Telegraf } from 'telegraf'
import { eq } from 'drizzle-orm'
import TonWeb from 'tonweb'
import {
  insertUserNotification,
  insertUserPurchase,
  selectFirstUserPurchaseByJettonId,
  selectLastUserNotificationByJettonId,
  selectLastUserPurchaseByJettonId,
  selectTokenByAddressAndWalletId,
  selectUserSettings,
  selectUserWallets,
  selectWalletById,
  upsertToken,
} from '../../../db/queries'
import { ENotificationType } from '../constants'
import type { TNotificationHandle, TTelegrafContext } from '../types'
import { getDbConnection, getJettonsByAddress, normalizePrice } from '../../../utils'
import { tokens, users } from '../../../db/schema'
import { i18n } from '../i18n'
import { getNotifications } from '.'
import { getPrice } from '../../../utils/parseTxData'
import { hiddenTickers } from '../../../constants'

export const handleNotification = async (bot: Telegraf<TTelegrafContext>) => {
  const db = await getDbConnection()
  const handle: TNotificationHandle = {
    rates: {
      top: Number(process.env.NOTIFICATION_RATE_UP),
      bottom: Number(process.env.NOTIFICATION_RATE_DOWN),
    },
    secondForPossibleRollback: Number(process.env.SECONDS_FROM_PURCHASE_WITH_ROLLBACK_POSSIBILITY),
    getPrice,
    getUsersInDb: () => db.select().from(users),
    getWalletsInDb: userId => selectUserWallets(db, userId),
    getJettonsFromDB: walletId => db.select().from(tokens).where(eq(tokens.walletId, walletId)),
    getJettonsFromChain: getJettonsByAddress,
    getLastAddressJettonPurchaseFromDB: (jettonId: number) =>
      selectLastUserPurchaseByJettonId(db, jettonId),
    getLastAddressNotificationFromDB: (jettonId: number) =>
      selectLastUserNotificationByJettonId(db, jettonId),
    getFirstAddressJettonPurchaseFromDB: (jettonId: number) =>
      selectFirstUserPurchaseByJettonId(db, jettonId),
  }
  for await (const notification of getNotifications(handle)) {
    if (hiddenTickers.includes(notification.symbol)) {
      continue
    }
    console.log({ notification })
    const userSettings = await selectUserSettings(db, notification.userId)
    if (notification.action === ENotificationType.NEW_JETTON) {
      const [wallet] = await selectWalletById(db, notification.walletId)
      const address = new TonWeb.utils.Address(wallet.address)
      const walletUserFriendly = address.toString(true, true, true)
      await upsertToken(db, {
        token: notification.jetton,
        walletId: notification.walletId,
        ticker: notification.symbol,
      })
      const [jetton] = await selectTokenByAddressAndWalletId(
        db,
        notification.jetton,
        notification.walletId,
      )
      await insertUserPurchase(db, {
        timestamp: notification.timestamp,
        jettonId: jetton.id,
        price: `${notification.price}`,
      })
      await bot.telegram.sendMessage(
        notification.userId,
        i18n(userSettings?.languageCode).message.detectedNewJetton(
          notification.symbol,
          walletUserFriendly,
          notification.price,
        ),
        {
          parse_mode: 'Markdown'
        }
      )
      continue
    }
    if (notification.action === ENotificationType.NOT_HOLD_JETTON_ANYMORE) {
      await db.delete(tokens).where(eq(tokens.id, notification.jettonId))
      await bot.telegram.sendMessage(
        notification.userId,
        i18n(userSettings?.languageCode).message.youNoLongerHaveJetton(notification.symbol),
      )
      continue
    }

    const [wallet] = await selectWalletById(db, notification.walletId)
    const address = new TonWeb.utils.Address(wallet.address)
    const walletUserFriendly = address.toString(true, true, true)
    const text =
      notification.action === ENotificationType.UP
        ? i18n(userSettings?.languageCode).message.notification.x2(
          notification.symbol,
          walletUserFriendly,
          normalizePrice(notification.price, notification.decimals),
        )
        : i18n(userSettings?.languageCode).message.notification.x05(
          notification.symbol,
          walletUserFriendly,
          normalizePrice(notification.price, notification.decimals),
        )
    await bot.telegram.sendMessage(notification.userId, text, { parse_mode: 'Markdown' })
    console.log('rates', notification.price.toString())
    await insertUserNotification(db, {
      timestamp: notification.timestamp,
      price: `${notification.price}`,
      jettonId: notification.jettonId,
    })
  }
  await db.close()
}
