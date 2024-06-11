import { fetchWithAuth } from ".";

export const getChart = async (jetton: string) => {
    const timestamp = Math.floor(Date.now() / 1000 - 604800);
  
    // console.info(timestamp);
  
    const url = (
      'https://tonapi.io/v2/rates/chart?token=' +
        jetton +
        '&currency=usd' +
        '&start_date=' + timestamp +
        '&points_count=100'
    );
  
    const chart: {
      points: [timestamp: number, price: number][]
    } = (await (await fetchWithAuth(url)).json());
  
    return chart.points;
  };
