export type TJettonData = {
  address: string
  symbol: string
  image?: string
  pnlPercentage: number
  chart: [timestamp: number, price: number | string][]
  lastBuyTime: number
}
