import { tonApiClient } from '../../constants'

export const getChart = async (jetton: string, timestamp: number) => {
  const chart: {
    points: [timestamp: number, price: number][]
  } = await tonApiClient.rates.getChartRates({
    token: jetton,
    currency: 'usd',
    start_date: timestamp,
    points_count: 100,
  })

  return chart.points
}
