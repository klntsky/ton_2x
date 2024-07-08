import { getAddressPnL, getChart, getJettonsByAddress } from '.'
import { filterHiddenJettons } from '../../services/bot/utils'

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
  for (const jettonInfo of filterHiddenJettons(jettons)) {
    const addressPnl = await getAddressPnL(address, jettonInfo.address)
    if (!addressPnl) continue
    const { pnlPercentage, lastBuyTime } = addressPnl
    const chart = await getChart(jettonInfo.address, lastBuyTime)
    const slicedChart = chart.filter(x => x[0] >= lastBuyTime)
    if (slicedChart.length < 2) {
      throw new Error(
        `slicedChart.length < 2: ${JSON.stringify(chart)}. Wallet: ${jettonInfo.address}, lastBuyTime: ${lastBuyTime}`,
      )
    }
    res[jettonInfo.symbol] = {
      ...jettonInfo,
      pnlPercentage,
      chart: slicedChart,
      lastBuyTime,
    }
  }

  return res
}
