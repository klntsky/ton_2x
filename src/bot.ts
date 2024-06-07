import process from 'process'
import 'dotenv/config'
import { init } from './utils'
import { getLogger } from './utils'

const start = async () => {
  const logger = getLogger('tg-bot')
  const bot = await init(
    process.env.TELEGRAM_BOT_TOKEN,
    {
      telegram: {
        webhookReply: false,
      },
    },
    logger,
  )

  bot.launch({
    webhook: {
      domain: process.env.TELEGRAM_BOT_WEBHOOK_DOMAIN,
      path: '/' + process.env.TELEGRAM_BOT_WEBHOOK_PATH,
      port: Number(process.env.TELEGRAM_BOT_WEBHOOK_PORT),
    },
  })

  // bot.telegram.setMyCommands([])
  // bot.telegram.setMyDescription(`
  //   Это description
  // `)
  // bot.telegram.setMyShortDescription(`Это short description`)
  logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', async () => {
    bot.stop('SIGINT')
  })
  process.once('SIGTERM', async () => {
    bot.stop('SIGTERM')
  })
}

start()
