import process from 'process'
import 'dotenv/config'
import { initBot } from './utils'
import { getLogger } from '../../utils'
import { i18n } from './i18n'

const start = async () => {
  const logger = getLogger('tg-bot')
  const bot = await initBot(
    process.env.TELEGRAM_BOT_TOKEN ||
      (() => {
        throw 'set TELEGRAM_BOT_TOKEN'
      })(),
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

  bot.telegram.setMyCommands(
    [
      {
        command: 'disconnect',
        description: i18n('ru').command.disconnect(),
      },
    ],
    {
      language_code: 'ru',
    },
  )
  bot.telegram.setMyCommands(
    [
      {
        command: 'disconnect',
        description: i18n('en').command.disconnect(),
      },
    ],
    {
      language_code: 'en',
    },
  )
  // bot.telegram.setMyDescription(`Description`)
  // bot.telegram.setMyShortDescription(`Short description`)
  logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', async () => {
    bot.stop('SIGINT')
  })
  process.once('SIGTERM', async () => {
    bot.stop('SIGTERM')
  })
}

start()
