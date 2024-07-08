import { TJettonData } from '.'

export type TGetWalletDataResponse = {
  walletsTotal: number
  jettons: TJettonData[]
}
