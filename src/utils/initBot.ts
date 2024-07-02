import process from 'process'
import 'dotenv/config'
import { Markup, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import TonWeb from 'tonweb'
import {
  getDbConnection,
  getLogger,
  handleNotification,
  logError,
  logUserAction,
  loopRetrying,
  saveUser,
} from '.'
import type { TTelegrafContext } from '../types'
import type { Logger } from 'winston'
import { i18n } from '../i18n'
import { insertUserAdress } from '../db/queries'
import { ECallback } from '../constants'
import { typeGuardByFields } from '../typeguards'
import type { CallbackQuery } from 'telegraf/typings/core/types/typegram'

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
    const db = await getDbConnection()
    await saveUser(db, ctx)
    await db.close()
    const startMessage = await ctx.reply(ctx.i18n.message.start(), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.webApp(ctx.i18n.button.linkWallet(), process.env.TELEGRAM_BOT_WEB_APP)],
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

  bot.on('callback_query', async ctx => {
    if (!typeGuardByFields<CallbackQuery.DataQuery>(ctx.update.callback_query, ['data'])) return
    if (ctx.update.callback_query.data === ECallback.SCENE_ADD_WALLET) {
      await ctx.reply('Send to me your wallet address')
      return
    }
  })

  bot.on(message('text'), async ctx => {
    const text = ctx.update.message.text
    if (![48, 64, 66].includes(text.length)) {
      throw new Error(`Not valid TON address: «${text}»`)
    }
    const address = new TonWeb.utils.Address(text)
    const rawAddress = address.toString(false)
    const db = await getDbConnection()
    await insertUserAdress(db, {
      userId: ctx.from.id,
      address: rawAddress,
    })
    await db.close()
    await ctx.reply('Wallet was linked successfully!', {
      reply_parameters: {
        message_id: ctx.update.message.message_id,
      },
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
