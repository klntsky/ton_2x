import type { Telegraf } from 'telegraf'
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
    const [wallet] = await insertUserAdress(db, payload)
    for (const jetton of jettons) {
      const [insertedJetton] = await upsertToken(db, {
        token: jetton.address,
        walletId: wallet.id,
        ticker: jetton.symbol,
      })
      const price = await getPrice(jetton.address)
      if (price) {
        await insertUserPurchase(db, {
          timestamp: Math.floor(Date.now() / 1000),
          jettonId: insertedJetton.id,
          price: `${price}`,
        })
      }
    }
    const address = new TonWeb.utils.Address(payload.address)
    const userFriendlyAddress = address.toString(true, true, true)
    await bot.telegram.sendMessage(
      payload.userId,
      i18n(userSettings?.languageCode).message.newWalletConnected(
        userFriendlyAddress,
        jettons.map(jetton => `$${jetton.symbol}`).join(', '),
      ),
      {
        parse_mode: 'Markdown',
      },
    )
  }
  return true
}
