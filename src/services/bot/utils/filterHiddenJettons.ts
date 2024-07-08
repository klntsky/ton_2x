import { hiddenTickers } from '../../../constants'
import type { TJetton } from '../../../types'

export const filterHiddenJettons = <GType extends string[] | TJetton[]>(jettons: GType): GType =>
  jettons.filter(
    jetton => !hiddenTickers.includes(typeof jetton === 'string' ? jetton : jetton.symbol),
  ) as GType
