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
  const { id, address } = req.query
  const userId = Number(id)
  console.log({ id, address })
  const result = await api(userId, address)
  return res.send(result)
}
