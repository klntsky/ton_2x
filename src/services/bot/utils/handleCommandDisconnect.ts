import TonWeb from 'tonweb'
import { deleteUserWallet, deleteUserWallets, selectUserWallets } from '../../../db/queries'
import { getEmojiForWallet } from '../../../utils'
import type { TTelegrafContext } from '../types'
import type { TDbConnection } from '../../../types'

export const handleCommandDisconnect = async (
  db: TDbConnection,
  ctx: TTelegrafContext,
  target: string,
) => {
  if (!target) {
    const userWallets = await selectUserWallets(db, ctx.from.id)
    if (userWallets.length === 0) {
      await ctx.reply(ctx.i18n.message.disconnect.noWallets())
      return
    }
    const disconnectWalletLines = userWallets.map(wallet => {
      const address = new TonWeb.utils.Address(wallet.address)
      const userFriendlyAddress = address.toString(true, true, true)
      return `/disconnect\\_${wallet.id} ${getEmojiForWallet(userFriendlyAddress)} \`${userFriendlyAddress}\``
    })
    await ctx.reply(ctx.i18n.message.disconnect.message(disconnectWalletLines.join('\n\n')), {
      parse_mode: 'Markdown',
    })
  } else if (target === 'all') {
    await deleteUserWallets(db, ctx.from.id)
    await ctx.reply(ctx.i18n.message.disconnect.allWalletsDisconnectedSuccessful())
  } else {
    const [deletedWallet] = await deleteUserWallet(db, ctx.from.id, Number(target))
    if (!deletedWallet) {
      await ctx.reply(ctx.i18n.message.error())
      await handleCommandDisconnect(db, ctx, '')
      return
    }
    const address = new TonWeb.utils.Address(deletedWallet.address)
    const userFriendlyAddress = address.toString(true, true, true)
    await ctx.reply(ctx.i18n.message.disconnect.walletDisconnectedSuccessful(userFriendlyAddress))
  }
}
