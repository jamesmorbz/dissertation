// services/dashboardService.ts
import apiClient from '@/lib/api-client';
import {
  BarDataPoint,
  WeeklyTotal,
  CarbonIntensity,
  LastUsage,
} from '@/types/data-point';
import { Device } from '@/types/device';

class DashboardService {
  getMonthlySummary() {
    return apiClient.get<BarDataPoint[]>('/data/monthly-summary');
  }

  getWeeklyTotal() {
    return apiClient.get<WeeklyTotal[]>('/data/weekly-total');
  }

  getCarbonIntensity() {
    return apiClient.get<CarbonIntensity>('/external/carbon-intensity');
  }

  getDevices() {
    return apiClient.get<Device[]>('/devices/');
  }

  getLastUsage() {
    return apiClient.get<LastUsage>('/data/last_usage');
  }
}

export const dashboardService = new DashboardService();
