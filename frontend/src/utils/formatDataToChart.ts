import { normalizePrice, timeConverter } from '.'

export const formatDataToChart = (input: {
  chart: [number, number][]
  decimals: number
}) =>
  input.chart.reverse().map(arr => {
    return {
      date: timeConverter(arr[0]),
      Price: normalizePrice(arr[1], input.decimals),
    }
  })
