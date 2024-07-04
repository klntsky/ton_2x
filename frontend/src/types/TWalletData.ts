export type TWalletData = {
  address: string
  symbol: string
  image?: string
  pnlPercentage: number
  chart: [timestamp: number, price: number][]
  lastBuyTime: number
}
