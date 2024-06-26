import { getAccountJettonHistory, getLastTimestampFromHistory, getPriceAtTimestamp } from '.'

export const getAddressPnL = async (account: string, jetton: string) => {
  const jettonHistory = await getAccountJettonHistory(account, jetton)
  // console.log('jettonHistory', jettonHistory);
  const lastTimestamp = getLastTimestampFromHistory(jettonHistory)
  // console.log('lastTimestamp', lastTimestamp);
  if (!lastTimestamp) {
    return 0
  }

  const priceAtBuy = await getPriceAtTimestamp(jetton, lastTimestamp)
  const currentPrice = await getPriceAtTimestamp(jetton, Math.floor(Date.now() / 1000))
  return {
    pnlPercentage: Math.floor((currentPrice / priceAtBuy - 1) * 100),
    lastBuyTime: lastTimestamp,
  }
}
