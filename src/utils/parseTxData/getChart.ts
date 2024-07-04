import { tonApiClient } from '../../constants'

export const getChart = async (jetton: string, timestamp: number) => {
  const chart: {
    points: [timestamp: number, price: number][]
  } = await tonApiClient.rates.getChartRates({
    token: jetton,
    currency: 'usd',
    start_date: timestamp,
    end_date: Math.floor(Date.now() / 1000),
    // points_count: 100,
  })
  // console.log({
  //   start_date: new Date(timestamp * 1000),
  //   firstPoint: chart.points.length ? new Date(chart.points[0][0] * 1000) : undefined,
  //   lastPoint: chart.points.length ? new Date(chart.points.at(-1)![0] * 1000) : undefined,
  // })

  return chart.points
}
