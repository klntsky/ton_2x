import { fetchWithAuth } from '.'

export const getPriceAt = async (jetton: string, timestamp: number) => {
  timestamp = Math.min(Math.floor(Date.now() / 1000 - 1000), timestamp)

  // console.info(timestamp);

  const url =
    'https://tonapi.io/v2/rates/chart?token=' +
    jetton +
    '&currency=usd' +
    '&start_date=' +
    timestamp +
    '&end_date=' +
    (timestamp + 1000) +
    '&points_count=1'

  const chart = await (await fetchWithAuth(url)).json()

  // console.info(chart);

  if (chart.points.length) {
    return chart.points[0][1]
  } else {
    return 0
  }
}
