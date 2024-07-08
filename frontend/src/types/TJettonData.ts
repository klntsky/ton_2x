export type TJettonData = {
  address: string
  symbol: string
  image?: string
  decimals: number
  pnlPercentage: number
  chart: [timestamp: number, price: number][]
  lastBuyTime: number
}
