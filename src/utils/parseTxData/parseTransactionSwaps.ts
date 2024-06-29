import type { Trace } from 'tonapi-sdk-js'

export function* parseTransactionSwaps(tx?: Trace): Generator<{
  asset_in: string
  asset_out: string
  amount_in: number
  amount_out: number
}> {
  if (typeof tx === 'undefined') {
    return
  }
  if (typeof tx.transaction === 'object') {
    for (const out_msg of tx.transaction.out_msgs) {
      if (out_msg.decoded_op_name === 'dedust_swap') {
        const asset_in =
          out_msg.decoded_body.asset_in.jetton.workchain_id +
          ':' +
          out_msg.decoded_body.asset_in.jetton.address
        const asset_out =
          out_msg.decoded_body.asset_out.jetton.workchain_id +
          ':' +
          out_msg.decoded_body.asset_out.jetton.address
        const amount_in = out_msg.decoded_body.amount_in
        const amount_out = out_msg.decoded_body.amount_out
        yield { asset_in, asset_out, amount_in, amount_out }
      } else {
        // console.log('out_msg', out_msg.decoded_op_name);
      }
    }
  } else {
    throw 'not an object'
  }

  if (tx.children instanceof Array) {
    for (const child of tx.children) {
      yield* parseTransactionSwaps(child)
    }
  } else {
    // console.error('not iterable', typeof tx.children);
  }
}
