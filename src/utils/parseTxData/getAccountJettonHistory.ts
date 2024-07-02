import { tonApiClient } from "../../services/bot/constants"

export const getAccountJettonHistory = async (account: string, jetton: string) => {
  const resp = await tonApiClient.accounts.getAccountJettonHistoryById(account, jetton, {
    limit: 100,
  })
  return resp.events
}
