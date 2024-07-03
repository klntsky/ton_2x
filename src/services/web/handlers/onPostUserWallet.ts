import { selectUserAdress } from '../../../db/queries'
import { getDbConnection } from '../../../utils'
import type { TRequestHandler } from '../types'
import { handleSuccessfulWalletLinkNotification } from '../utils'

export const onPostUserWallet: TRequestHandler<{
  id: string
  address: string
}> = async (req, res) => {
  const { id, address } = req.body
  const userId = Number(id)
  const db = await getDbConnection()
  const [wallet] = await selectUserAdress(db, address, userId)
  if (!wallet) {
    await handleSuccessfulWalletLinkNotification({
      userId,
      address,
    })
  }
  await db.close()
  return res.send()
}
