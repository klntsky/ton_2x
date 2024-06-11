// {
//   "id": "e87ce22f95d9b1ec486994b46512bf459acff094ffb038b64802adbf39414bfd",
//   "utime": 46932252000001

import { fetchWithAuth } from ".";

// },
export const getTraceIdsByAddress = async (address: string, limit: number = 30) => {
  const url = (
    // TODO: do something with limit
    'https://tonapi.io/v2/accounts/' + encodeURIComponent(address) +
      `/traces?limit=${limit}`
  );

  const traces: {
    id: string
    utime: number
  }[] = (await (await fetchWithAuth(url)).json()).traces;
  // console.info('getTraceIdsByAddress', traces);
  return traces;
};
