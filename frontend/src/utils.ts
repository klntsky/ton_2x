import type { TChartData } from './types';

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

export const chartColor = (arr: TChartData[]) => {
  if (Number(arr[0].Price) >= Number(arr.at(-1)!.Price)) {
    return ['red'];
  } else {
    return ['emerald'];
  }
};

export const formatDataToChart = (input: { chart: [number, number][] }) =>
  input.chart.map(arr => {
    const price =
      arr[1] > 0.01 ? Number(arr[1].toFixed(2)) : arr[1].toFixed(20);
    return {
      date: timeConverter(arr[0]),
      Price: price,
    };
  });

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
