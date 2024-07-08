import type { Trace } from 'tonapi-sdk-js'
import { collectFromGenerator, parseTransactionSwaps } from '.'

export const getAllSwaps = (tx: Trace) => {
  return collectFromGenerator(parseTransactionSwaps.bind(null, tx))
}
