import 'dotenv/config';
const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));

const fetchWithAuth = async url => {
  const resp = await fetch(
        url,
        {
          headers: {
            Authorization: 'Bearer ' + process.env['TONAPI_TOKEN']
          }
        }
  ).then(x => x.json());

  if (resp.error) {
    await delay(1000);
    console.info('im deboooooooooooooooouncccccinggggg');
    return fetchWithAuth(url);
  }
  return { json: () => resp };
};

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
    'https://tonapi.io/v2/traces/' + hash
  );

  const traces = await (await fetchWithAuth(url)).json();
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
      '/traces?limit=30'
  );

  const traces = (await (await fetchWithAuth(url)).json()).traces;
  // console.info('getTraceIdsByAddress', traces);
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
const getJettonsByAddress = async address => {
  const url = (
    'https://tonapi.io/v2/accounts/' + encodeURIComponent(address) +
      '/jettons'
  );

  try {
    const jettons = (await (await fetchWithAuth(url)).json()).balances
          .filter(x => x.balance !== '0')
          .map(x => ({
            address: x?.jetton?.address,
            symbol: x?.jetton?.symbol,
            image: x?.jetton?.image
          }));

    return jettons;
  } catch (e) {
    console.error(e);
    return [];
  }
};

const getAccountJettonHistory = async (account, jetton) => {
  const url = (
    'https://tonapi.io/v2/accounts/' + account +
      '/jettons/' + jetton +
      '/history?limit=100'
  );
  const resp = (await (await fetchWithAuth(url)).json());
  return resp.events;
};

const getLastTimestampFromHistory = jettonHistory => {
  try {
    return jettonHistory[0].timestamp;
  } catch (_) {
    return null;
  }
};

const getChart = async (jetton) => {
  const timestamp = Math.floor(Date.now() / 1000 - 604800);

  // console.info(timestamp);

  const url = (
    'https://tonapi.io/v2/rates/chart?token=' +
      jetton +
      '&currency=usd' +
      '&start_date=' + timestamp +
      '&points_count=100'
  );

  const chart = (await (await fetchWithAuth(url)).json());

  return chart.points;
};

const getPriceAt = async (jetton, timestamp) => {
  timestamp = Math.min(Math.floor(Date.now() / 1000 - 1000), timestamp);

  // console.info(timestamp);

  const url = (
    'https://tonapi.io/v2/rates/chart?token=' +
      jetton +
      '&currency=usd' +
      '&start_date=' + timestamp +
      '&end_date=' + (timestamp + 1000) +
      '&points_count=1'
  );

  const chart = (await (await fetchWithAuth(url)).json());

  // console.info(chart);

  return chart.points[0][1];
};

const getAddressPnL = async (account, jetton) => {
  const jettonHistory = await getAccountJettonHistory(account, jetton);
  // console.log('jettonHistory', jettonHistory);
  const lastTimestamp = getLastTimestampFromHistory(jettonHistory);
  // console.log('lastTimestamp', lastTimestamp);
  if (!lastTimestamp) {
    return 0;
  }

  const priceAtBuy = await getPriceAt(jetton, lastTimestamp);
  const currentPrice = await getPriceAt(jetton, Math.floor(Date.now() / 1000));
  return {
    pnlPercentage: Math.floor((((currentPrice / priceAtBuy) - 1) * 100)),
    lastBuyTime: lastTimestamp
  };
};

const api = async (address) => {

  const jettons = await getJettonsByAddress(address);
  const res = [];
  for (const jettonInfo of jettons) {
    const { pnlPercentage, lastBuyTime } = await getAddressPnL(
      address, jettonInfo.address
    );
    const chart = await getChart(jettonInfo.address);
    const slicedChart = chart.filter(x => x[0] > lastBuyTime);
    // console.log({ ...jettonInfo, pnl });
    console.log(chart, lastBuyTime, slicedChart);
    res.push({
      ...jettonInfo,
      pnlPercentage,
      chart: (slicedChart.length >= 2 ? slicedChart : chart).reverse(),
      lastBuyTime
    });
  }

  return res;
};

// const main = async () => {
//   const account = ''; // your account in 0:12345 format here
//   const res = await api(account);
//   console.log(account, JSON.stringify(res, false, 4));
// };

// main();
