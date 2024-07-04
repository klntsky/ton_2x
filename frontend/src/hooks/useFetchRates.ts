import { useQuery } from 'react-query'
import { TGetWalletDataResponse } from '../types'

const fetchRates = async (id: number): Promise<TGetWalletDataResponse> => {
  const response = await fetch(`/getWalletData?id=${id}`)
  if (!response.ok) {
    throw new Error('error fetching data.')
  }
  return response.json()
}

export const useFetchRates = (props: {
  walletsCount: number
  userId: number
}) => {
  return useQuery(['walletData', props.walletsCount], () => {
    return fetchRates(props.userId)
  })
}
