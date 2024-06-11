import { fetchWithAuth } from ".";

export const getJettonsByAddress = async (address: string) => {
    const url = (
      'https://tonapi.io/v2/accounts/' + encodeURIComponent(address) +
        '/jettons'
    );
  
    try {
      const jettons: {
        address: string
        symbol: string
        image: string
      }[] = (await (await fetchWithAuth(url)).json()).balances
            .filter((x: { balance: string }) => x.balance !== '0')
            .map((x: {
              jetton?: {
                address?: string
                symbol?: string
                image?: string
              }
            }) => ({
              address: x?.jetton?.address,
              symbol: x?.jetton?.symbol,
              image: x?.jetton?.image
            }));
  
      return jettons;
    } catch (e) {
      console.error(e);
      return [];
    }
  };
  