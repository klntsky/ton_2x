import process from 'process'
import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { session } from 'telegraf'
import { getLogger, logUserAction } from '../utils'
import type { TTelegrafContext } from '../types'
import type { Logger } from 'winston'

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
    await ctx.reply('Hi!')
    await logUserAction(ctx, {
      start: ctx.payload || 1,
    })
  })

//   bot.command('help', async ctx => {})

//   bot.on('callback_query', async ctx => {})

//   bot.on('inline_query', async ctx => {})

//   bot.on(message('text'), async ctx => {})

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
    } finally {}
  })

  return bot
}
