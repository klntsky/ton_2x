import process from 'process'
import 'dotenv/config'
import { initBot, sendMessageToBotUsers } from './utils'
import { getLogger } from './utils'

const start = async () => {
  const logger = getLogger('tg-bot')
  const bot = await initBot(
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

  //   sendMessageToBotUsers(bot, `
  // Мы были приятно удивлены тем, сколько людей залетело в бота прямо с питча, и решили продолжить развивать этот проект!

  // Цель номер один - доделать нашу киллер-фичу - алерты, когда монета делает 2x от цены покупки (на хакатоне было мало времени и мы не успели, но у нас почти всё готово).

  // Подписывайтесь на наш канал с анонсами - @ton_2x_ru.
  // `)
}

start()
