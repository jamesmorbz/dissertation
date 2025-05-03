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

export type WeeklyTotal = {
  total: number;
  start: string;
  stop: string;
};

export type WeeklyData = {
  weeklyUsage: number | null;
  weeklyUsageTrend: number | null;
  thisWeek: WeeklyTotal | null;
  lastWeek: WeeklyTotal | null;
};

type IntensityPayload = {
  forecast: number;
  actual: number;
  index: carbonIntensityIndex;
};
export type CarbonIntensity = {
  from: string;
  to: string;
  intensity: IntensityPayload;
};

export const carbonIntensityIndex = [
  'very low',
  'low',
  'moderate',
  'high',
  'very high',
] as const;
export type carbonIntensityIndex = (typeof carbonIntensityIndex)[number];

export const timeRanges = ['1D', '7D', '14D', '30D'] as const;
export type Lookback = (typeof timeRanges)[number];
