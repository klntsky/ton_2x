// swap may be long, e.g. TON -> USDT -> SCALE
// we want to get only the first IN jetton and the last OUR jetton
export const getSwapPair = (
  swaps: {
    asset_in: string
    asset_out: string
    amount_out: number
    amount_in: number
  }[],
) => {
  return swaps.slice().pop()
  // res.asset_in = swaps[0].asset_in;
  // res.amount_in = swaps[0].amount_in;
  // res.asset_out = swaps[swaps.length - 1].asset_out;
  // res.amount_out = swaps[swaps.length - 1].amount_out;
}
