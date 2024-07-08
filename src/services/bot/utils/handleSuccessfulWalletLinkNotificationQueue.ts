import amqplib from 'amqplib'
import { successfulWalletLinkNotificationCh } from '../../../constants/amqpChannels'
import type { TSuccessfulWalletLinkNotificationCh } from '../../../types'
import type { Telegraf } from 'telegraf'
import type { TTelegrafContext } from '../types'
import { getDbConnection } from '../../../utils'
import { handleSuccessfulWalletLinkNotification } from '.'

export const handleSuccessfulWalletLinkNotificationQueue = async (
  bot: Telegraf<TTelegrafContext>,
) => {
  return new Promise((resolve, reject) => {
    amqplib
      .connect(process.env.AMQP_ENDPOINT)
      .then(amqp => amqp.createChannel())
      .then(inputChannel => {
        inputChannel.assertQueue(successfulWalletLinkNotificationCh, {
          durable: true,
        })
        inputChannel.prefetch(1)

        inputChannel.consume(successfulWalletLinkNotificationCh, async msg => {
          if (msg === null) {
            return
          }
          const payload: TSuccessfulWalletLinkNotificationCh = JSON.parse(msg.content.toString())
          console.log({ payload })
          const db = await getDbConnection()
          const isHandled = await handleSuccessfulWalletLinkNotification(bot, db, payload)
          if (isHandled) {
            inputChannel.ack(msg)
          } else {
            inputChannel.nack(msg)
          }
          await db.close()
        })
      })
      .catch(error => reject(error))
  })
}
