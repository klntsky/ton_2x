import { getSwapHistoryByAddress, getSwapPairs } from ".";

// Here, we get the price the user bought at
export const getAssetsByAddressFromSwapHistory = async (address: string) => {
  const swapHistory = await getSwapHistoryByAddress(address);
  const swapPairs = getSwapPairs(swapHistory);
  return swapPairs;
};
