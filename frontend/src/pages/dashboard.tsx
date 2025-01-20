import { OverviewChart } from '@/components/dashboard/overview-chart';
import { DeviceCard } from '@/components/dashboard/device-card';
import { CurrentUsageCard } from '@/components/dashboard/current-usage-card';
import { WeeklyUsageCard } from '@/components/dashboard/weekly-usage-card';
import { CarbonIntensityCard } from '@/components/dashboard/carbon-intensity-card';
import { EnergyTariffCard } from '@/components/dashboard/energy-tariff-card';
import { Navbar } from '@/components/navbar/navbar';
import { Device } from '@/types/device';
import { useState, useEffect, useCallback } from 'react';
import { WeeklyData, BarDataPoint, CarbonIntensity } from '@/types/data-point';
import { SkeletonCard } from '@/components/shared/skeleton-card';
import { dataService } from '@/services/data';
import { deviceService } from '@/services/devices';

export function Dashboard() {
  const [overviewChartData, setOverviewChartData] = useState<
    BarDataPoint[] | null
  >(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    weeklyUsage: null,
    weeklyUsageTrend: null,
    thisWeek: null,
    lastWeek: null,
  });
  const [carbonIntensity, setCarbonIntensity] =
    useState<CarbonIntensity | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentTotalUsage, setCurrentTotalUsage] = useState<number | null>(
    null,
  );
  const [, setIsLoading] = useState(true);

  const fetchWeeklyData = useCallback(async () => {
    try {
      const weeklyTotals = await dataService.getWeeklyTotal();
      const lastWeek = weeklyTotals.data[0];
      const thisWeek = weeklyTotals.data[1];
      const weeklyUsageTrend =
        ((thisWeek.total - lastWeek.total) / lastWeek.total) * 100;

      setWeeklyData({
        weeklyUsage: thisWeek.total,
        weeklyUsageTrend,
        thisWeek,
        lastWeek,
      });
    } catch (error) {
      console.error('Error fetching weekly totals:', error);
      setWeeklyData({
        weeklyUsage: null,
        weeklyUsageTrend: null,
        thisWeek: null,
        lastWeek: null,
      });
    }
  }, []);

  const fetchDevicesAndUsage = useCallback(async () => {
    try {
      const [deviceData, usageData] = await Promise.all([
        deviceService.getDevices(),
        deviceService.getDeviceLastUsage(),
      ]);

      const updatedDevices = deviceData.data.map((device) => ({
        ...device,
        last_usage: usageData.data[device.hardware_name]?.last_usage ?? 0,
      }));

      const totalUsage = Object.values(usageData.data).reduce(
        (sum, hardware) => sum + (hardware.last_usage ?? 0),
        0,
      );

      setDevices(updatedDevices);
      setCurrentTotalUsage(totalUsage);
    } catch (error) {
      console.error('Error fetching devices or usage:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        dataService
          .getMonthlySummary()
          .then((summary) => setOverviewChartData(summary.data))
          .catch((error) => {
            console.error('Error fetching monthly summary:', error);
            setOverviewChartData(null);
          }),
        fetchWeeklyData(),
        dataService
          .getCarbonIntensity()
          .then((intensity) => setCarbonIntensity(intensity.data))
          .catch((error) => {
            console.error('Error fetching carbon intensity:', error);
            setCarbonIntensity(null);
          }),
        fetchDevicesAndUsage(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWeeklyData, fetchDevicesAndUsage]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <CurrentUsageCard
            last_usage={currentTotalUsage}
            onRefresh={fetchDevicesAndUsage}
          />
          <WeeklyUsageCard
            weeklyUsage={weeklyData.weeklyUsage}
            weeklyUsageTrend={weeklyData.weeklyUsageTrend}
            thisWeek={weeklyData.thisWeek}
            lastWeek={weeklyData.lastWeek}
            onRefresh={fetchWeeklyData}
          />
          {carbonIntensity ? (
            <CarbonIntensityCard carbonIntensity={carbonIntensity} />
          ) : (
            <SkeletonCard />
          )}
          <EnergyTariffCard energyTariff={23} energyTariffTrend={50} />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {overviewChartData ? (
            <OverviewChart overviewChartData={overviewChartData} />
          ) : (
            <SkeletonCard />
          )}
          <DeviceCard devices={devices} />
        </div>
      </main>
    </div>
  );
}
