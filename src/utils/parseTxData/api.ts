import { getAddressPnL, getChart, getJettonsByAddress } from '.'
import { getDbConnection } from '..'
import { upsertToken } from '../../db/queries'

export const api = async (address: string) => {
  const jettons = await getJettonsByAddress(address)
  const res: ((typeof jettons)[number] & {
    pnlPercentage?: number
    chart: [timestamp: number, price: number][]
    firstBuyTime: number
  })[] = []
  const db = await getDbConnection()
  for (const jettonInfo of jettons) {
    await upsertToken(db, {
      token: jettonInfo.address,
      ticker: jettonInfo.symbol,
      wallet: address,
      decimals: jettonInfo.decimals,
    })
    const addressPnl = await getAddressPnL(address, jettonInfo.address)
    if (!addressPnl) continue
    const { pnlPercentage, firstBuyTime } = addressPnl
    const chart = await getChart(jettonInfo.address, firstBuyTime)
    const slicedChart = chart.filter(x => x[0] >= firstBuyTime)
    // console.log(chart, firstBuyTime, slicedChart)
    res.push({
      ...jettonInfo,
      pnlPercentage,
      chart: (slicedChart.length >= 2 ? slicedChart : chart).reverse(),
      firstBuyTime,
    })
  }
  await db.close()

  return res.sort((a, b) => a.firstBuyTime - b.firstBuyTime)
}
