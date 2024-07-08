import TonWeb from 'tonweb'
import type { Address } from 'tonweb/dist/types/utils/address'
import type { TTelegrafContext } from '../types'
import { getDbConnection, getJettonsByAddress } from '../../../utils'
import {
  countUserWallets,
  insertUserAdress,
  selectUserAdress,
  upsertToken,
} from '../../../db/queries'
import type { Message, Update } from 'telegraf/typings/core/types/typegram'

export const handleAddingAddress = async (
  ctx: TTelegrafContext<Update.MessageUpdate<Message.TextMessage>>,
) => {
  const text = ctx.update.message.text
  let address: Address
  try {
    address = new TonWeb.utils.Address(text)
  } catch (error) {
    await ctx.reply(ctx.i18n.message.iDontUnderstand(), {
      reply_parameters: {
        message_id: ctx.update.message.message_id,
      },
    })
    return
  }
  const rawAddress = address.toString(false)
  const db = await getDbConnection()
  const [existedWallet] = await selectUserAdress(db, rawAddress, ctx.from.id)
  try {
    if (existedWallet) {
      await ctx.reply(ctx.i18n.message.walletConnectedAlready(), {
        reply_parameters: {
          message_id: ctx.update.message.message_id,
        },
      })
      return
    }
    const [userWallets] = await countUserWallets(db, ctx.from.id)
    if (userWallets.count >= Number(process.env.LIMIT_WALLETS_FOR_USER)) {
      await ctx.reply(ctx.i18n.message.reachedMaxAmountOfWallets(), {
        reply_parameters: {
          message_id: ctx.update.message.message_id,
        },
      })
      return
    }
    const [insertedWallet] = await insertUserAdress(db, {
      userId: ctx.from.id,
      address: rawAddress,
    })
    const jettons = await getJettonsByAddress(rawAddress)
    for (const jetton of jettons) {
      await upsertToken(db, {
        token: jetton.address,
        walletId: insertedWallet.id,
        ticker: jetton.symbol,
      })
    }
    const userFriendlyAddress = address.toString(true, true, true)
    await ctx.reply(
      ctx.i18n.message.newWalletConnected(
        userFriendlyAddress,
        jettons.map(jetton => `$${jetton.symbol}`).join(', '),
      ),
      {
        parse_mode: 'Markdown',
        reply_parameters: {
          message_id: ctx.update.message.message_id,
        },
      },
    )
  } finally {
    await db.close()
  }
}
