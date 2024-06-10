import { timeConverter } from '../utils';

export const chartResp = {
  chart: [
    [1717695341, 8.720633043116738e-8],
    [1717701715, 8.594913628147731e-8],
    [1717708074, 8.508462155897288e-8],
    [1717714434, 8.073619160819534e-8],
    [1717720791, 7.94562491181225e-8],
    [1717727147, 8.249449577463167e-8],
    [1717733505, 8.365130461440509e-8],
    [1717733505, 8.365130461440509e-8],
  ],
};

export type ChartResponse = typeof chartResp;

export const chartData = chartResp.chart
  .reverse()
  .map(arr => ({ date: timeConverter(arr[0]), Price: arr[1] }));

export interface ChartData {
  date: number;
  Price: number;
}
export interface WalletData {
  symbol: string;
  image: string;
  pnlPercentage: number;
  chart: [number, number][];
}
