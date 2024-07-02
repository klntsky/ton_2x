import amqplib from 'amqplib'
import { successfulWalletLinkNotificationCh } from '../../../constants/amqpChannels'
import type { TSuccessfulWalletLinkNotificationCh } from '../../../types'

export const handleSuccessfulWalletLinkNotification = async (
  message: TSuccessfulWalletLinkNotificationCh,
) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const outputChannel = await amqp.createChannel()
  const bufferData = Buffer.from(JSON.stringify(message))
  outputChannel.sendToQueue(successfulWalletLinkNotificationCh, bufferData, { persistent: true })
  await outputChannel.close()
  await amqp.close()
}
