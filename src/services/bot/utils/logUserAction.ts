import { getTelegramUser } from '.'
import type { TTelegrafContext } from '../types'

export const logUserAction = async (
  ctx: TTelegrafContext,
  logEntity: Record<string, string | number>,
) => {
  const { id, user } = getTelegramUser(ctx.from)
  ctx.logger.info({ id, user, ...logEntity })
}
