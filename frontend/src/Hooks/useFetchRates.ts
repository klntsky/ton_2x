import { useQuery } from 'react-query';
import { TWalletData } from '../types';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

const fetchRates = async (
  address: string | null,
  id: number,
): Promise<TWalletData[]> => {
  const url = `/getWalletData?address=${address || ''}&id=${id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('error fetching data.');
  }
  return response.json();
};

export const useFetchRates = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const address = queryParams.get('address') || null;
  const launchParams = retrieveLaunchParams();

  return useQuery(['walletData', address], () =>
    fetchRates(address, launchParams.initData!.user!.id),
  );
};
