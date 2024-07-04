import { hiddenTickers } from '../../../constants'
import { selectUserWallets } from '../../../db/queries'
import { getDbConnection } from '../../../utils'
import { api } from '../../../utils/parseTxData'
import type { TRequestHandler } from '../types'

export const onGetWalletData: TRequestHandler<
unknown,
unknown,
{
  id: string
  address: string
}
> = async (req, res) => {
  const { id } = req.query
  const userId = Number(id)
  console.log({ id })
  const db = await getDbConnection()
  const userWallets = await selectUserWallets(db, userId)
  await db.close()
  const uniqJettonsObject: Awaited<ReturnType<typeof api>> = {}
  for (const wallet of userWallets) {
    const result = await api(wallet.address)
    Object.entries(result).forEach(([ticker, info]) => {
      if (
        !hiddenTickers.includes(info.symbol) &&
        (!uniqJettonsObject[ticker] || uniqJettonsObject[ticker].lastBuyTime < info.lastBuyTime)
      ) {
        uniqJettonsObject[ticker] = info
      }
    })
  }
  const response = Object.values(uniqJettonsObject).sort((a, b) => b.lastBuyTime - a.lastBuyTime)
  return res.send({
    walletsTotal: userWallets.length,
    jettons: response,
  })
}
