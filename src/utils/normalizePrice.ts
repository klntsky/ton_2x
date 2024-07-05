export const normalizePrice = (price: number, decimals?: number) =>
  price > 0.01 ? Number(price.toFixed(2)) : price.toFixed(decimals || 20)
