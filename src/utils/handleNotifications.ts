import type { Telegraf } from 'telegraf'
import { getJettonsByAddress } from '.'
import { tokens, userPurchases, userSettings, users, wallets } from '../db/schema'
import { getDbConnection } from './getDbConnection'
import type { TTelegrafContext } from '../types'
import { desc, eq } from 'drizzle-orm'
import { getTraceIdsByAddress, getTracesByTxHash } from './parseTxData'
import { userNotifications } from '../db/schema/userNotifications'
import { i18n } from '../i18n'
import {
  deleteJettonByWallet,
  selectLastUserNotificationByWalletAndJetton,
  selectLastUserPurchaseByWalletAndJetton,
} from '../db/queries'

type UserAddress = string
type JettonAddress = string

// A jetton that exists on some wallet
type WalletJetton = {
  amount: number
}

type NotificationHandle = {
  getPrice: (jetton: JettonAddress) => Promise<
  | {
    price: number
    timestamp: number
  }
  | undefined
  >
  // wallets: AsyncIterableIterator<typeof wallets.$inferSelect>,
  users: AsyncIterableIterator<typeof users.$inferSelect>
  getJettonsFromChain: (user: UserAddress) => Promise<
  {
    address: JettonAddress
    symbol?: string // Why it can be undefined?
  }[]
  >
  getLastAddressJettonPurchaseFromDB: (
    address: UserAddress,
    jetton: JettonAddress,
  ) => Promise<typeof userPurchases.$inferSelect | undefined>
  getLastAddressNotificationFromDB: (
    user: UserAddress,
    jetton: JettonAddress,
  ) => Promise<typeof userNotifications.$inferSelect | undefined>
  deleteUserJetton: (user: UserAddress, jetton: JettonAddress) => Promise<void>
}

export async function* getNotifications(handle: NotificationHandle) {
  const {
    getLastAddressJettonPurchaseFromDB,
    getLastAddressNotificationFromDB,
    getJettonsFromChain,
    getPrice,
  } = handle
  for await (const user of handle.users) {
    for await (const wallet of getWallets({ userId: user.id })) {
      const addressJettons = await getJettonsFromChain(wallet.address)
      for (const jetton of addressJettons) {
        const tokenOnChain = await getPrice(jetton.address)
        if (!tokenOnChain) {
          continue
        }
        const lastPurchase = await getLastAddressJettonPurchaseFromDB(
          wallet.address,
          jetton.address,
        )
        const lastNotification = await getLastAddressNotificationFromDB(
          wallet.address,
          jetton.address,
        )
        const newestTransaction =
          lastPurchase && lastNotification
            ? lastPurchase.timestamp > lastNotification.timestamp
              ? lastPurchase
              : lastNotification
            : lastPurchase || lastNotification
        if (!newestTransaction || tokenOnChain.timestamp <= newestTransaction.timestamp) {
          continue
        }
        const rate = tokenOnChain.price / newestTransaction.price
        const rateDirection = rate >= 2 ? 'up' : rate <= 0.5 ? 'down' : undefined
        if (!rateDirection) {
          continue
        }
        yield {
          userId: user.id,
          wallet: wallet.address,
          jetton: jetton.address,
          symbol: jetton.symbol || 'UNKNOWN TOCKER',
          price: tokenOnChain.price,
          rate: rateDirection,
          timestamp: tokenOnChain.timestamp,
          languageCode: undefined,
        }
      }
    }
  }
}

export async function* getUsers() {
  const db = await getDbConnection()
  const usersInDb = await db.select().from(users)
  // drizzle orm .iterator() for PostgreSQL WIP
  for (const user of usersInDb) {
    yield user
  }
}

export async function* getWallets(handle: { userId: number }) {
  const { userId } = handle
  const db = await getDbConnection()
  const walletsInDb = await db.select().from(wallets).where(eq(wallets.userId, userId))
  for await (const wallet of walletsInDb) {
    yield wallet
  }
}

export const newHandleNotification = async (bot: Telegraf<TTelegrafContext>) => {
  const db = await getDbConnection()
  for await (const notification of getNotifications({
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
    users: getUsers(),
    getJettonsFromChain: getJettonsByAddress,
    getLastAddressJettonPurchaseFromDB: (address: string, jetton: string) =>
      selectLastUserPurchaseByWalletAndJetton(db, address, jetton),
    getLastAddressNotificationFromDB: (address: string, jetton: string) =>
      selectLastUserNotificationByWalletAndJetton(db, address, jetton),
    deleteUserJetton: (user: string, jetton: string) => deleteJettonByWallet(db, jetton, user),
  })) {
    const languageCode = notification.languageCode === 'ru' ? 'ru' : 'en'
    const text =
      notification.rate === 'up'
        ? i18n[languageCode].message.notification.x2(notification.symbol, notification.wallet)
        : i18n[languageCode].message.notification.x05(notification.symbol, notification.wallet)
    await bot.telegram.sendMessage(notification.userId, text)
    await db.insert(userNotifications).values({
      timestamp: notification.timestamp,
      price: notification.price,
      wallet: notification.wallet,
      jetton: notification.jetton,
    })
  }
}

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
            i18n[languageCode].message.notification.x2(jetton.ticker, user.address),
          )
        } else if (rate <= 0.5) {
          await bot.telegram.sendMessage(
            user.userId,
            i18n[languageCode].message.notification.x05(jetton.ticker, user.address),
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
