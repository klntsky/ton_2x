import type { Telegraf } from 'telegraf'
import { getJettonsByAddress } from '.'
import { tokens, userPurchases, userSettings, wallets } from '../db/schema'
import { getDbConnection } from './getDbConnection'
import type { TTelegrafContext } from '../types'
import { desc, eq } from 'drizzle-orm'
import { getTraceIdsByAddress, getTracesByTxHash } from './parseTxData'
import { userNotifications } from '../db/schema/userNotifications'
import { i18n } from '../i18n'

export const handleNotifications = async (bot: Telegraf<TTelegrafContext>) => {
  await using db = await getDbConnection()
  const walletsInDb = await db.connection.select().from(wallets)
  for (const user of walletsInDb) {
    const [userLanguageCode] = await db.connection
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
    const jettonsInDb = await db.connection
      .select()
      .from(tokens)
      .where(eq(tokens.wallet, user.address))
    for (const jetton of jettonsInDb) {
      if (!jettonsActualObj[jetton.token]) {
        await db.connection.delete(tokens).where(eq(tokens.token, jetton.token))
        await bot.telegram.sendMessage(
          user.userId,
          i18n[languageCode].message.youNoLongerHaveJetton(jetton.ticker),
        )
        continue
      }
      const [trace] = await getTraceIdsByAddress(jetton.token, 1)
      const txTrace = await getTracesByTxHash(trace.id)
      const value = txTrace.transaction.out_msgs[0].value
      const [lastPurchase] = await db.connection
        .select()
        .from(userPurchases)
        .where(eq(userPurchases.jetton, jetton.token))
        .orderBy(desc(userPurchases.timestamp))
        .limit(1)
      const [lastNotification] = await db.connection
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
        await db.connection.insert(userNotifications).values({
          timestamp: txTrace.transaction.utime,
          price: value,
          walletId: user.address,
          jetton: jetton.token,
        })
      }
      await db.connection.insert(userPurchases).values({
        timestamp: txTrace.transaction.utime,
        price: value,
        walletId: user.address,
        jetton: jetton.token,
      })
      delete jettonsActualObj[jetton.token]
    }
    for (const [address, { symbol }] of Object.entries(jettonsActualObj)) {
      await db.connection.insert(tokens).values({
        wallet: user.address,
        token: address,
        ticker: symbol,
      })
    }
  }
}
