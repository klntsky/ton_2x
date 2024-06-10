import { ChartResponse, chartData } from './mock/ratesChart';

export function timeConverter(UNIX_timestamp: number) {
  const a = new Date(UNIX_timestamp * 1000);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  const hour = a.getHours();
  const min = a.getMinutes();
  const sec = a.getSeconds();
  const time =
    date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

export const reversePrice = (price: number) => 1 / price;

type RatesChartArr = typeof chartData;

export const chartColor = (arr: RatesChartArr) => {
  if (arr[0]['Price'] >= arr[arr.length - 1]['Price']) {
    return ['red'];
  } else {
    return ['emerald'];
  }
};

export const countDelta = (arr: RatesChartArr) => {
  const delta =
    Math.round((arr[0]['Price'] - arr[arr.length - 1]['Price']) * 100) / 100;
  return delta;
};

export const formatDataToChart = (input: ChartResponse) =>
  input.chart.map(arr => ({ date: timeConverter(arr[0]), Price: arr[1] }));

export const badgeType = (input: number) => {
  if (input < 0) {
    return 'moderateDecrease';
  }
  if (input > 0) {
    return 'moderateIncrease';
  } else {
    return 'unchanged';
  }
};

export const statusText = (input: number) =>
  input > 0 ? 'Прибыль:' : 'Убыток:';
