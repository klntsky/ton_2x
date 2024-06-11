import { getAllSwaps, getTraceIdsByAddress, getTracesByTxHash } from ".";

export const getSwapHistoryByAddress = async (address: string) => {
    const traceIds = await getTraceIdsByAddress(address);
    const swaps = [];
    for (const { id } of traceIds) {
      const txTrace = await getTracesByTxHash(id);
      const txSwaps = getAllSwaps(txTrace);
      swaps.push(txSwaps);
    }
    return swaps;
  };
