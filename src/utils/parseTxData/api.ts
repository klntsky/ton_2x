import { getAddressPnL, getChart, getJettonsByAddress } from '.'

export const api = async (userId: number, address: string) => {
  const jettons = await getJettonsByAddress(address)
  const res: ((typeof jettons)[number] & {
    pnlPercentage?: number
    chart: [timestamp: number, price: number][]
    firstBuyTime: number
  })[] = []
  for (const jettonInfo of jettons) {
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

  return res.sort((a, b) => a.firstBuyTime - b.firstBuyTime)
}
