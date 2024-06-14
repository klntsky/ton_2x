import { collectFromGenerator, parseTransactionSwaps } from '.'
import type { TTransaction } from '../../types'

export const getAllSwaps = (tx: TTransaction) => {
  return collectFromGenerator(parseTransactionSwaps.bind(null, tx))
}
