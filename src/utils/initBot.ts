import process from 'process'
import 'dotenv/config'
import { Telegraf } from 'telegraf'
import {
  getDbConnection,
  getLogger,
  getTelegramUser,
  handleNotification,
  logError,
  logUserAction,
  loopRetrying,
} from '.'
import type { TTelegrafContext } from '../types'
import type { Logger } from 'winston'
import { i18n } from '../i18n'
import { upsertUser, upsertUserSettings } from '../db/queries'

export const initBot = async (
  token: string,
  options: Partial<Telegraf.Options<TTelegrafContext>>,
  logger: Logger = getLogger('tg-publisher-bot'),
) => {
  const bot = new Telegraf<TTelegrafContext>(token, options)

  bot.use(async (ctx, next) => {
    ctx.logger ??= logger
    ctx.i18n ??= i18n(ctx.from.language_code)
    next()
  })

  bot.start(async ctx => {
    const { user } = getTelegramUser(ctx.from)
    const db = await getDbConnection()
    await upsertUser(db, {
      id: ctx.from.id,
      timestamp: Math.floor(Date.now() / 1000),
      username: user,
    })
    if (ctx.from.language_code) {
      await upsertUserSettings(db, {
        userId: ctx.from.id,
        languageCode: ctx.from.language_code,
      })
    }
    await db.close()
    const startMessage = await ctx.reply(ctx.i18n.message.start(), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.i18n.button.linkWallet(),
              web_app: {
                url: process.env.TELEGRAM_BOT_WEB_APP,
              },
            },
          ],
        ],
      },
    })
    await ctx.pinChatMessage(startMessage.message_id)
    await ctx.setChatMenuButton({
      type: 'web_app',
      text: ctx.i18n.button.link(),
      web_app: {
        url: process.env.TELEGRAM_BOT_WEB_APP,
      },
    })
    await logUserAction(ctx, {
      start: ctx.payload || 1,
    })
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
      await ctx.reply(ctx.i18n.message.error())
    } finally {
      await logError(ctx.logger, error, { ctx: JSON.stringify(ctx.update) })
    }
  })

  loopRetrying(() => handleNotification(bot), {
    logger: logger,
    afterCallbackDelayMs: 10_000,
    catchDelayMs: 10_000,
  })

  return bot
}
