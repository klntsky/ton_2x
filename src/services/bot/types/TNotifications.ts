import type { ENotificationType } from '../constants'

type TBaseNotification = {
  userId: number
  walletId: number
  jettonId: number
  symbol: string
}

export type TJettonRateNotification = TBaseNotification & {
  price: number
  timestamp: number
  action: ENotificationType.UP | ENotificationType.DOWN
}
export type TNewJettonNotification = Omit<TBaseNotification, 'jettonId'> & {
  jetton: string
  price: number
  timestamp: number
  decimals: number
  action: ENotificationType.NEW_JETTON
}
export type TNotHoldedJettonNotification = TBaseNotification & {
  action: ENotificationType.NOT_HOLD_JETTON_ANYMORE
}

export type TNotification =
  | TJettonRateNotification
  | TNewJettonNotification
  | TNotHoldedJettonNotification
