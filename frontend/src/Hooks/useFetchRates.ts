import { useQuery } from 'react-query';
import { TWalletData } from '../types';

const fetchRates = async (address: string | null): Promise<TWalletData[]> => {
  const url = `/getWalletData?address=${address || ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('error fetching data.');
  }
  return response.json();
};

export const useFetchRates = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const address = queryParams.get('address') || null;

  return useQuery(['walletData', address], () => fetchRates(address));
};
