import { getAccountJettonHistory, getPriceAtTimestamp } from '.'

export const getAddressPnL = async (account: string, jetton: string) => {
  const jettonHistory = await getAccountJettonHistory(account, jetton)
  if (jettonHistory.length === 0) {
    return null
  }
  const lastTimestamp = jettonHistory[0].timestamp

  const priceAtBuy = await getPriceAtTimestamp(jetton, lastTimestamp)
  const currentPrice = await getPriceAtTimestamp(jetton, Math.floor(Date.now() / 1000) - 1000, true)
  const pnlPercentage =
    currentPrice && priceAtBuy ? Math.floor((currentPrice / priceAtBuy - 1) * 100) : undefined
  // console.log({ lastTimestamp, priceAtBuy, currentPrice, pnlPercentage })
  return {
    pnlPercentage,
    lastBuyTime: lastTimestamp,
  }
}
