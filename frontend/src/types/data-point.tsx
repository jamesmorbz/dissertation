export type BarDataPoint = {
  date: string;
  [key: string]: number | string;
};

export type LineDataPoint = {
  time: Date;
  value: number;
};

export type LastUsage = {
  [hardwareName: string]: {
    last_usage: number;
  };
};

export const timeRanges = [
  '1H',
  '3H',
  '6H',
  '12H',
  '24H',
  '7D',
  '14D',
  '30D',
] as const;
export type Lookback = (typeof timeRanges)[number];
