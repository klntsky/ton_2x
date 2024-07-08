import { Markup, type Telegraf } from 'telegraf'
import TonWeb from 'tonweb'
import type { TTelegrafContext } from '../types'
import type { TDbConnection, TSuccessfulWalletLinkNotificationCh } from '../../../types'
import {
  countUserWallets,
  insertUserAdress,
  insertUserPurchase,
  selectUserAdress,
  selectUserSettings,
  upsertToken,
} from '../../../db/queries'
import { i18n } from '../i18n'
import { getJettonsByAddress } from '../../../utils'
import { getPrice } from '../../../utils/parseTxData'
import { filterHiddenJettons } from '.'
import type { userPurchases } from '../../../db/schema'
import { tokens } from '../../../db/schema'
import { and, eq } from 'drizzle-orm'

export const handleSuccessfulWalletLinkNotification = async (
  bot: Telegraf<TTelegrafContext>,
  db: TDbConnection,
  payload: TSuccessfulWalletLinkNotificationCh,
) => {
  const [wallet] = await selectUserAdress(db, payload.address, payload.userId)
  if (wallet) {
    return true
  }
  const userSettings = await selectUserSettings(db, payload.userId)
  const [userWallets] = await countUserWallets(db, payload.userId)
  if (userWallets.count >= Number(process.env.LIMIT_WALLETS_FOR_USER)) {
    await bot.telegram.sendMessage(
      payload.userId,
      i18n(userSettings?.languageCode).message.reachedMaxAmountOfWallets(),
    )
  } else {
    const jettons = await getJettonsByAddress(payload.address)
    const jettonsForDb: (Omit<typeof tokens.$inferInsert, 'walletId'> &
    Omit<typeof userPurchases.$inferInsert, 'jettonId' | 'price'> & { price?: number })[] = []
    for (const jetton of jettons) {
      const price = await getPrice(jetton.address)
      jettonsForDb.push({
        token: jetton.address,
        ticker: jetton.symbol,
        price,
        timestamp: Math.floor(Date.now() / 1000),
      })
    }
    await db.transaction(async tx => {
      const [wallet] = await insertUserAdress(tx, payload)
      for (const jetton of jettonsForDb) {
        await upsertToken(tx, {
          token: jetton.token,
          walletId: wallet.id,
          ticker: jetton.ticker,
        })
        if (jetton.price) {
          const [insertedToken] = await tx
            .select()
            .from(tokens)
            .where(and(eq(tokens.token, jetton.token), eq(tokens.walletId, wallet.id)))
          await insertUserPurchase(tx, {
            timestamp: Math.floor(Date.now() / 1000),
            jettonId: insertedToken.id,
            price: `${jetton.price}`,
          })
        }
      }
    })
    const address = new TonWeb.utils.Address(payload.address)
    const userFriendlyAddress = address.toString(true, true, true)
    const message = await bot.telegram.sendMessage(
      payload.userId,
      i18n(userSettings?.languageCode).message.newWalletConnected(
        userFriendlyAddress,
        filterHiddenJettons(jettons)
          .map(jetton => `$${jetton.symbol}`)
          .join(', '),
      ),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            Markup.button.webApp(i18n(userSettings?.languageCode).button.openApp(), process.env.TELEGRAM_BOT_WEB_APP),
          ]],
        }
      },
    )
    await bot.telegram.pinChatMessage(payload.userId, message.message_id)
    await bot.telegram.setChatMenuButton({
      chatId: payload.userId,
      menuButton: {
        type: 'web_app',
        text: i18n(userSettings?.languageCode).button.open(),
        web_app: {
          url: process.env.TELEGRAM_BOT_WEB_APP,
        },
      }
    })
  }
  return true
}
