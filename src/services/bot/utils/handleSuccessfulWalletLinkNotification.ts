import amqplib from 'amqplib'
import { successfulWalletLinkNotificationCh } from '../../../constants/amqpChannels'
import type { TSuccessfulWalletLinkNotificationCh } from '../../../types'
import type { Telegraf } from 'telegraf'
import type { TTelegrafContext } from '../types'
import { countUserWallets, insertUserAdress, selectUserSettings } from '../../../db/queries'
import { getDbConnection, getJettonsByAddress } from '../../../utils'
import { i18n } from '../i18n'

export const handleSuccessfulWalletLinkNotification = async (bot: Telegraf<TTelegrafContext>) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const inputChannel = await amqp.createChannel()
  await inputChannel.assertQueue(successfulWalletLinkNotificationCh, {
    durable: true,
  })
  await inputChannel.prefetch(1)

  inputChannel.consume(successfulWalletLinkNotificationCh, async msg => {
    if (msg === null) {
      return
    }
    const payload: TSuccessfulWalletLinkNotificationCh = JSON.parse(msg.content.toString())
    const db = await getDbConnection()
    const userSettings = await selectUserSettings(db, payload.userId)
    const [userWallets] = await countUserWallets(db, payload.userId)
    if (userWallets.count >= Number(process.env.LIMIT_WALLETS_FOR_USER)) {
      await bot.telegram.sendMessage(
        payload.userId,
        i18n(userSettings?.languageCode).message.reachedMaxAmountOfWallets(),
      )
    } else {
      const jettons = await getJettonsByAddress(payload.address)
      await insertUserAdress(db, payload)
      await bot.telegram.sendMessage(
        payload.userId,
        i18n(userSettings?.languageCode).message.newWalletConnected(
          payload.address,
          jettons.map(jetton => jetton.symbol),
        ),
      )
    }
    await db.close()
  })
}
