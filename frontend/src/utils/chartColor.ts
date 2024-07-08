import { TChartData } from '../types'

export const chartColor = (arr: TChartData[]) => {
  if (Number(arr[0].Price) >= Number(arr.at(-1)!.Price)) {
    return ['red']
  } else {
    return ['emerald']
  }
}
