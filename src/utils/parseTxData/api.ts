import { getAddressPnL, getChart, getJettonsByAddress } from '.'

export const api = async (address: string) => {
  const jettons = await getJettonsByAddress(address)
  const res: Record<
  string,
  (typeof jettons)[number] & {
    pnlPercentage?: number
    chart: [timestamp: number, price: number][]
    lastBuyTime: number
  }
  > = {}
  for (const jettonInfo of jettons) {
    const addressPnl = await getAddressPnL(address, jettonInfo.address)
    if (!addressPnl) continue
    const { pnlPercentage, lastBuyTime } = addressPnl
    const chart = await getChart(jettonInfo.address, lastBuyTime)
    const slicedChart = chart.filter(x => x[0] >= lastBuyTime)
    // console.log(chart, lastBuyTime, slicedChart)
    res[jettonInfo.symbol] = {
      ...jettonInfo,
      pnlPercentage,
      chart: (slicedChart.length >= 2 ? slicedChart : chart).reverse(),
      lastBuyTime,
    }
  }

  return res
}
