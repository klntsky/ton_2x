import { useQuery } from 'react-query'
import { TWalletData } from '../types'

const fetchRates = async (id: number): Promise<TWalletData[]> => {
  const response = await fetch(`/getWalletData?id=${id}`)
  if (!response.ok) {
    throw new Error('error fetching data.')
  }
  return response.json()
}

export const useFetchRates = (props: { userId: number }) => {
  return useQuery(['walletData', props.userId], () => {
    return fetchRates(props.userId)
  })
}
