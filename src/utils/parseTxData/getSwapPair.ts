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
}
