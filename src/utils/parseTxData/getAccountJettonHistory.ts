import { fetchWithAuth } from '.'

export const getAccountJettonHistory = async (account: string, jetton: string) => {
  const url =
    'https://tonapi.io/v2/accounts/' + account + '/jettons/' + jetton + '/history?limit=100'
  const resp = await (await fetchWithAuth(url)).json()
  return resp.events
}
