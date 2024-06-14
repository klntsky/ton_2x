import type { Context } from 'telegraf'
import type { TTelegrafSession } from '.'
import type { Logger } from 'winston'
import type { Update, User } from 'telegraf/typings/core/types/typegram'
import { TI18nLocalization } from '../i18n/types'

export type TTelegrafContext<GUpdate extends Update = Update> = Context<GUpdate> & {
  from: User
} & {
  session: TTelegrafSession
  i18n: TI18nLocalization
  logger: Logger
}
