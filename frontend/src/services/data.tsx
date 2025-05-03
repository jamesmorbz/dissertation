import apiClient from '@/lib/api-client';
import { BarDataPoint, WeeklyTotal, CarbonIntensity } from '@/types/data-point';
import { Lookback } from '@/types/data-point';

class DataService {
  getMonthlySummary() {
    return apiClient.get<BarDataPoint[]>('/data/monthly-summary');
  }

  getWeeklyTotal() {
    return apiClient.get<WeeklyTotal[]>('/data/weekly-total');
  }

  getCarbonIntensity() {
    return apiClient.get<CarbonIntensity>('/external/carbon-intensity');
  }

  getDeviceData(
    deviceId: string,
    lookback: Lookback,
    lookbackMap: Record<Lookback, string>,
    interval: string = '1m',
    aggregation: string = 'max',
  ) {
    const startTimestamp = Math.floor(Date.now() / 1000);
    const lookbackSeconds = lookbackMap[lookback];

    return apiClient.get(`/data/device/${deviceId}`, {
      params: {
        start_timestamp: startTimestamp,
        lookback: lookbackSeconds,
        interval: interval,
        aggregation: aggregation,
      },
    });
  }

  getHistoricalCarbonIntensity(days: number = 7) {
    return apiClient.get(
      `/external/carbon-intensity/historical-values/${days}`,
    );
  }
}

export const dataService = new DataService();
