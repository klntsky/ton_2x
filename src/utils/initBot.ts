import process from 'process'
import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
// import { session } from 'telegraf'
import { getDbConnection, getLogger, handleNotifications, logError, logUserAction, loopRetrying } from '.'
import type { TTelegrafContext } from '../types'
import type { Logger } from 'winston'
import { insertUserAdress } from '../db/queries'
import { userSettings } from '../db/schema'
import { i18n } from '../i18n'

export const initBot = async (
  token: string,
  options: Partial<Telegraf.Options<TTelegrafContext>>,
  logger: Logger = getLogger('tg-publisher-bot'),
) => {
  const bot = new Telegraf<TTelegrafContext>(token, options)

  bot.use(async (ctx, next) => {
    if (!ctx.logger) {
      ctx.logger = logger
    }
    if (!ctx.i18n) {
      ctx.i18n = ctx.from.language_code === 'ru' ? i18n.ru : i18n.en
    }
    next()
  })

  // bot.use(
  //   session({
  //     defaultSession: () => ({}),
  //     // TODO: -> .json
  //   //   store: MySQL<TTelegrafSession>({
  //   //     host: process.env.DB_HOST,
  //   //     port: Number(process.env.DB_PORT),
  //   //     database: process.env.DB_DATABASE,
  //   //     user: process.env.DB_USER,
  //   //     password: process.env.DB_PASSWORD,
  //   //     table: 'telegraf_sessions',
  //   //   }),
  //   }),
  // )

  bot.start(async ctx => {
    if (ctx.from.language_code) {
      const db = await getDbConnection()
      await db.insert(userSettings).values({
        userId: ctx.from.id,
        languageCode: ctx.from.language_code,
      })
    }
    const startMessage = await ctx.reply(ctx.i18n.message.start(), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: ctx.i18n.button.linkWallet(),
            web_app: {
              url: process.env.TELEGRAM_BOT_WEB_APP,
            }
          }
        ]],
      }
    })
    await ctx.pinChatMessage(startMessage.message_id)
    await ctx.setChatMenuButton({
      type: 'web_app',
      text: ctx.i18n.button.link(),
      web_app: {
        url: process.env.TELEGRAM_BOT_WEB_APP
      }
    })
    await logUserAction(ctx, {
      start: ctx.payload || 1,
    })
  })

//   bot.command('help', async ctx => {})

//   bot.on('callback_query', async ctx => {})

//   bot.on('inline_query', async ctx => {})

//   bot.on(message('web_app_data'), async ctx => {
//     // await ctx.reply(JSON.stringify(ctx.update.message.web_app_data, null, 2))
//     const adresesses: {
//       address: string
//       friendlyAddress: string
//     } = JSON.parse(ctx.update.message.web_app_data.data)
//     const db = await getDbConnection()
//     await insertUserAdress(db, ctx.from.id, adresesses.address)
//     const url = new URLSearchParams(process.env.TELEGRAM_BOT_WEB_APP)
//     url.set('address', adresesses.address)
//     const successMessage = await ctx.reply(`
// 🔥 Теперь ты можешь сразу увидеть прибыль по всему своему кошельку или выбранной монете 💎 и с легкостью вывести свою прибыль вовремя 🤩

// Я пришлю тебе сообщение как только одна из твоих монет сделает x2 🔜

// Если у тебя возникнут какие-то вопросы, не стесняйся задавать их в [чате](https://t.me/+prK7rt-771VmZTAy) ❤️
// `, {
//   parse_mode: 'Markdown',
//   reply_markup: {
//     inline_keyboard: [[
//       {
//         text: 'Открыть',
//         web_app: {
//           url: process.env.TELEGRAM_BOT_WEB_APP,
//         }
//       }
//     ]],
//   }
// })
//     await ctx.pinChatMessage(successMessage.message_id)
//     await ctx.setChatMenuButton({
//       type: 'web_app',
//       text: 'Открыть',
//       web_app: {
//         url: process.env.TELEGRAM_BOT_WEB_APP
//       }
//     })
//   })

  bot.catch(async (err, ctx) => {
    const error =
      err instanceof Error
        ? err
        : {
          name: 'Unknown error',
          message: JSON.stringify(err),
        }
    // In case we catch errors when sending messages
    try {
      await ctx.reply(`Some error occured!`)
    } finally {
      await logError(ctx.logger, error, { ctx: JSON.stringify(ctx.update) })
    }
  })

  loopRetrying(() => handleNotifications(bot), {
    logger: logger,
    afterCallbackDelayMs: 10_000,
    catchDelayMs: 10_000,
  })

  return bot
}
