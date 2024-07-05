export const normalizePrice = (price: number) =>
  price > 0.01 ? Number(price.toFixed(2)) : price.toFixed(20)
