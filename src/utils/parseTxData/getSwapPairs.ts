import { getSwapPair } from ".";

// get swap history and remove intermediate swaps from all swaps
export const getSwapPairs = (swapHistory: {
  asset_in: string
  asset_out: string
  amount_out: number
  amount_in: number
}[][]) => {
  const swapPairs = [];

  for (const swaps of swapHistory) {
    if (swaps.length) {
      swapPairs.push(getSwapPair(swaps));
    }
  }

  return swapPairs;
};
