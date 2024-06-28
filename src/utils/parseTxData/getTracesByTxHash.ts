import { tonApiClient } from '../../constants'

export const getTracesByTxHash = async (hash: string) => {
  const traces = await tonApiClient.traces.getTrace(hash)
  return traces
}
