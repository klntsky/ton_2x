import 'dotenv/config';

function collectFromGenerator(generatorFunc) {
    const result = [];
    const generator = generatorFunc();

    for (let value of generator) {
        result.push(value);
    }

    return result;
}

function* parseTransactionSwaps (tx) {
  if (typeof tx === 'undefined') {
    return;
  }
  // console.log('parseTransactionSwaps', tx.interfaces);
  if (typeof tx.transaction === 'object')  {
    // iterate over in messages
    const in_msg = tx.transaction.in_msg;
    //    console.log('in', in_msg.decoded_op_name, in_msg.decoded_body);

    // iterate over out messages
    for (const out_msg of tx.transaction.out_msgs) {
      if (out_msg.decoded_op_name === 'dedust_swap') {
        const asset_in = (
          out_msg.decoded_body.asset_in.jetton.workchain_id + ':' +
            out_msg.decoded_body.asset_in.jetton.address
        );
        const asset_out = (
          out_msg.decoded_body.asset_out.jetton.workchain_id + ':' +
            out_msg.decoded_body.asset_out.jetton.address
        );
        const amount_in = out_msg.decoded_body.amount_in;
        const amount_out = out_msg.decoded_body.amount_out;
        yield { asset_in, asset_out, amount_in, amount_out };
      } else {
        // console.log('out_msg', out_msg.decoded_op_name);
      }
    }

  } else {
    throw 'not an object';
  }

  // iterate over children
  if (tx.children instanceof Array) {
    for (const child of tx.children) {
      yield* parseTransactionSwaps(child);
    }
  } else {
    // console.error('not iterable', typeof tx.children);
  }
}

export const getAllSwaps = (tx) => {
  return collectFromGenerator(parseTransactionSwaps.bind(null, tx));
};

// fetches traces to be parsed for us.
export const getTracesByTxHash = async hash => {
  const url = (
    'https://tonapi.io/v2/traces/' + hash +
      '?token=' + process.env['TONAPI_TOKEN']
  );

  const traces = await (await fetch(url)).json();
  return traces;
};

// {
//   "id": "e87ce22f95d9b1ec486994b46512bf459acff094ffb038b64802adbf39414bfd",
//   "utime": 46932252000001
// },
export const getTraceIdsByAddress = async address => {
  const url = (
    // TODO: do something with limit
    'https://tonapi.io/v2/accounts/' + encodeURIComponent(address) +
      '/traces?limit=30' +
      '&token=' + process.env['TONAPI_TOKEN']
  );

  const traces = (await (await fetch(url)).json()).traces;
  console.info('getTraceIdsByAddress', traces);
  return traces;
};

export const getSwapHistoryByAddress = async address => {
  const traceIds = await getTraceIdsByAddress(address);
  const swaps = [];
  for (const { id } of traceIds) {
    const txTrace = await getTracesByTxHash(id);
    const txSwaps = getAllSwaps(txTrace);
    swaps.push(txSwaps);
  }
  return swaps;
};

// swap may be long, e.g. TON -> USDT -> SCALE
// we want to get only the first IN jetton and the last OUR jetton
export const getSwapPair = swaps => {
  return swaps.slice().pop();
  // res.asset_in = swaps[0].asset_in;
  // res.amount_in = swaps[0].amount_in;
  // res.asset_out = swaps[swaps.length - 1].asset_out;
  // res.amount_out = swaps[swaps.length - 1].amount_out;
};

// get swap history and remove intermediate swaps from all swaps
const getSwapPairs = swapHistory => {
  const swapPairs = [];

  for (const swaps of swapHistory) {
    if (swaps.length) {
      swapPairs.push(getSwapPair(swaps));
    }
  }

  return swapPairs;
};

// Here, we get the price the user bought at
const getAssetsByAddressFromSwapHistory = async address => {
  const swapHistory = await getSwapHistoryByAddress(address);
  const swapPairs = getSwapPairs(swapHistory);
  return swapPairs;
};

// just the jetton id
export const getJettonsByAddress = async (address: string) => {
  const url = (
    'https://tonapi.io/v2/accounts/' + encodeURIComponent(address) +
      '/jettons' +
      '?token=' + process.env.TONAPI_TOKEN
  );

  const response = await fetch(url)
  const json: {
    balances: [
      {
        balance: string
        jetton: {
          address: string
          symbol: string
          image: string
        }
      }
    ], 
  } = await response.json()

  const jettons = json.balances
        .filter(x => x.balance !== '0')
        .map(x => ({
          address: x?.jetton?.address,
          symbol: x?.jetton?.symbol,
          image: x?.jetton?.image
        }));

  return jettons;
};

// const main = async () => {
//   const address = ''// address here
//   const jettons = await getJettonsByAddress(address);
//   console.log(jettons);
// };

// main();
