import { getAddressPnL, getChart, getJettonsByAddress } from '.'
import { getDbConnection } from '..'
import { insertToken } from '../../db/queries'

export const api = async (address: string) => {
  const jettons = await getJettonsByAddress(address)
  const res: ((typeof jettons)[number] & {
    pnlPercentage: number
    chart: [timestamp: number, price: number][]
    lastBuyTime: number
  })[] = []
  const db = await getDbConnection()
  for (const jettonInfo of jettons) {
    await insertToken(db, {
      token: jettonInfo.address,
      ticker: jettonInfo.symbol,
      walletAddress: address,
    })
    const addressPnl = await getAddressPnL(address, jettonInfo.address)
    if (!addressPnl) continue
    const { pnlPercentage, lastBuyTime } = addressPnl
    const chart = await getChart(jettonInfo.address)
    const slicedChart = chart.filter(x => x[0] > lastBuyTime)
    // console.log({ ...jettonInfo, pnl });
    console.log(chart, lastBuyTime, slicedChart)
    res.push({
      ...jettonInfo,
      pnlPercentage,
      chart: (slicedChart.length >= 2 ? slicedChart : chart).reverse(),
      lastBuyTime,
    })
  }

  return res
}
