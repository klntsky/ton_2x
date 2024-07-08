import { tonApiClient } from '../../constants'
import { jettonNamesWithSpecialCharacters } from '../../services/bot/constants'
import type { TJetton } from '../../types'

export const getJettonsByAddress = async (address: string) => {
  try {
    const jettons: TJetton[] = (
      await tonApiClient.accounts.getAccountJettonsBalances(address)
    ).balances
      .filter((x: { balance: string }) => x.balance !== '0')
      .map(
        (x: {
          jetton: {
            address: string
            symbol: string
            decimals: number
            image?: string
          }
        }) => ({
          address: x.jetton.address,
          symbol: jettonNamesWithSpecialCharacters[x.jetton.symbol] || x.jetton.symbol,
          decimals: x.jetton.decimals,
          image: x.jetton?.image,
        }),
      )
    return jettons
  } catch (e) {
    console.error(`tonApiClient.accounts.getAccountJettonsBalances(${address})`, e)
    throw e
  }
}
