import apiClient from '@/lib/api-client';
import { BarDataPoint, WeeklyTotal, CarbonIntensity } from '@/types/data-point';

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
}

export const dataService = new DataService();
