import { tonApiClient } from "../../services/bot/constants"

export const getPriceAtTimestamp = async (jetton: string, timestamp: number, lastPrice?: boolean) => {
  const chart: {
    points: [timestamp: number, price: number][]
  } = await tonApiClient.rates.getChartRates({
    token: jetton,
    currency: 'usd',
    start_date: timestamp,
    end_date: timestamp + 1000,
    points_count: 1,
  })

  return chart.points.length ? chart.points.at(lastPrice ? -1 : 0)![1] : undefined
}
