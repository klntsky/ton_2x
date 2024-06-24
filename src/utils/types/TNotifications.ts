import type { ENotificationType } from '../../constants'

type TBaseNotification = {
  userId: number
  wallet: string
  jetton: string
  symbol: string
}

export type TJettonRateNotification = TBaseNotification & {
  price: number
  timestamp: number
  action: ENotificationType.UP | ENotificationType.DOWN
}
export type TNewJettonNotification = TBaseNotification & {
  price: number
  timestamp: number
  action: ENotificationType.NEW_JETTON
}
export type TNotHoldedJettonNotification = TBaseNotification & {
  action: ENotificationType.NOT_HOLD_JETTON_ANYMORE
}

export type TNotification =
  | TJettonRateNotification
  | TNewJettonNotification
  | TNotHoldedJettonNotification
