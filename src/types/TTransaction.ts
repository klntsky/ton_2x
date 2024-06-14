// TODO: not a full type definition
export type TTransaction = {
  transaction: {
    utime: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    in_msg: any
    out_msgs: {
      value: number
      decoded_op_name: string
      decoded_body: {
        asset_in: {
          jetton: {
            workchain_id: string
            address: string
          }
        }
        asset_out: {
          jetton: {
            workchain_id: string
            address: string
          }
        }
        amount_in: number
        amount_out: number
      }
    }[]
  }
  children: TTransaction[]
}
