import process from 'process'
import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { session } from 'telegraf'
import { getDbConnection, getLogger, logError, logUserAction } from '../utils'
import type { TTelegrafContext } from '../types'
import type { Logger } from 'winston'
import { insertUserAdress } from '../db/queries'

export const init = async (
  token: string,
  options: Partial<Telegraf.Options<TTelegrafContext>>,
  logger: Logger = getLogger('tg-publisher-bot'),
) => {
  const bot = new Telegraf<TTelegrafContext>(token, options)

  bot.use(async (ctx, next) => {
    if (!ctx.logger) {
      ctx.logger = logger
    }
    next()
  })

  bot.use(
    session({
      defaultSession: () => ({}),
      // TODO: -> .json
    //   store: MySQL<TTelegrafSession>({
    //     host: process.env.DB_HOST,
    //     port: Number(process.env.DB_PORT),
    //     database: process.env.DB_DATABASE,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASSWORD,
    //     table: 'telegraf_sessions',
    //   }),
    }),
  )

  bot.start(async ctx => {
    const startMessage = await ctx.reply('Hi!', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '➕ Кошелёк',
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
      text: '➕ Кошелёк',
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

  bot.on(message('web_app_data'), async ctx => {
    // await ctx.reply(JSON.stringify(ctx.update.message.web_app_data, null, 2))
    const adresesses: {
      address: string
      friendlyAddress: string
    } = JSON.parse(ctx.update.message.web_app_data.data)
    const db = await getDbConnection()
    await insertUserAdress(db, ctx.from.id, adresesses.address)
    await ctx.reply(`🎉 Кошелек успешно привязан!`)
  })

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

  return bot
}
