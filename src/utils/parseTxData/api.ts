import { getAddressPnL, getChart, getJettonsByAddress } from '.'
import { normalizePrice } from '..'

export const api = async (address: string) => {
  const jettons = await getJettonsByAddress(address)
  const res: Record<
  string,
  (typeof jettons)[number] & {
    pnlPercentage?: number
    chart: [timestamp: number, price: number | string][]
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
      chart: (slicedChart.length >= 2 ? slicedChart : chart)
        .reverse()
        .map(entity => [entity[0], normalizePrice(entity[1], jettonInfo.decimals)]),
      lastBuyTime,
    }
  }

  return res
}
