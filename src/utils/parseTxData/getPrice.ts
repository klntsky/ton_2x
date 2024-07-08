import { tonApiClient } from '../../constants'

export const getPrice = async (jetton: string) => {
  const { rates } = await tonApiClient.rates.getRates({
    tokens: [jetton],
    currencies: ['usd'],
  })
  const price = rates[jetton].prices?.['USD']
  return price
}
