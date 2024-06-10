import { useEffect, useState } from 'react';
import { WalletData } from '../mock/ratesChart';

export const useFetchRates = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const address = queryParams.get('address') || null;

  const url = address
    ? `https://ton2x.memeplex.pics/getWalletData?address=${address}`
    : 'https://ton2x.memeplex.pics/getWalletData';
  const [data, setData] = useState<WalletData[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('error fetch data.');
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { data, isLoading, error };
};
