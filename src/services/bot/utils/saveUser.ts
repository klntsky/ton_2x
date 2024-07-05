import { getTelegramUser } from '.'
import { upsertUser, upsertUserSettings } from '../../../db/queries'
import type { TDbConnection } from '../../../types'
import type { TTelegrafContext } from '../types'

export const saveUser = async (db: TDbConnection, ctx: TTelegrafContext) => {
  const { user } = getTelegramUser(ctx.from)
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
}
