import { tonApiClient } from '../../constants'

export const getPriceAtTimestamp = async (jetton: string, timestamp: number) => {
  // TODO: culprit of the wrong .pnlPercentage (1000 -> 604800, as in src/utils/parseTxData/getChart.ts)
  const newTimestamp = Math.min(Math.floor(Date.now() / 1000 - 604800), timestamp)

  const chart: {
    points: [timestamp: number, price: number][]
  } = await tonApiClient.rates.getChartRates({
    token: jetton,
    currency: 'usd',
    start_date: newTimestamp,
    end_date: newTimestamp + 1000,
    points_count: 1,
  })

  return chart.points.length ? chart.points[0][1] : undefined
}
