import { tonApiClient } from '../../services/bot/constants'

export const getTraceIdsByAddress = async (address: string, limit: number = 30) => {
  const response = await tonApiClient.accounts.getAccountTraces(address, {
    limit,
  })
  return response.traces
}
