import 'dotenv/config';
import { delay } from "..";

export const fetchWithAuth = async (url: string): Promise<{ json: () => any}> => {
    const resp = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + process.env.TONAPI_TOKEN
      }
    }).then(x => x.json());
  
    if (resp.error) {
      await delay(1000);
      console.info('im deboooooooooooooooouncccccinggggg');
      return fetchWithAuth(url);
    }
    return { json: () => resp };
  };
  
