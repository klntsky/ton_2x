import { useQuery } from 'react-query'
import { TWalletData } from '../types'

const fetchRates = async (
  address: string | null,
  id: number,
): Promise<TWalletData[]> => {
  const response = await fetch(`/getWalletData?address=${address}&id=${id}`)
  if (!response.ok) {
    throw new Error('error fetching data.')
  }
  return response.json()
}

export const useFetchRates = (props: { address: string; userId: number }) => {
  return useQuery(['walletData', props.address], () => {
    return fetchRates(props.address, props.userId)
  })
}
