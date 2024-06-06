import type { Context } from 'telegraf'
import type { TTelegrafSession } from '.'
import type { Logger } from 'winston'
import type { Update, User } from 'telegraf/typings/core/types/typegram'

export type TTelegrafContext<GUpdate extends Update = Update> = Context<GUpdate> & {
  from: User
} & {
  session: TTelegrafSession
  logger: Logger
}