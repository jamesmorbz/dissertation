import { OverviewChart } from '@/components/dashboard/overview-chart';
import { DeviceCard } from '@/components/dashboard/device-card';
import { CurrentUsageCard } from '@/components/dashboard/current-usage-card';
import { WeeklyUsageCard } from '@/components/dashboard/weekly-usage-card';
import { CarbonIntensityCard } from '@/components/dashboard/carbon-intensity-card';
import { EnergyTariffCard } from '@/components/dashboard/energy-tariff-card';
import { Navbar } from '@/components/navbar/navbar';
import { Device } from '@/types/device';
import apiClient from '@/lib/api-client';
import { useState, useEffect } from 'react';
import {
  LastUsage,
  WeeklyTotal,
  BarDataPoint,
  CarbonIntensity,
} from '@/types/data-point';
import { SkeletonCard } from '@/components/shared/skeleton-card';

export function Dashboard() {
  const fetchMonthlySummary = async () => {
    let weeklyTotals: BarDataPoint[] = [];
    try {
      weeklyTotals = (await apiClient.get('/data/monthly-summary')).data;
      return weeklyTotals;
    } catch (error) {
      console.error('Failed to fetch monthly summary:', error);
      return [];
    }
  };
  const [overviewChartData, setOverviewChartData] = useState<
    BarDataPoint[] | null
  >(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const monthlySummary = await fetchMonthlySummary();
        setOverviewChartData(monthlySummary);
      } catch (error) {
        console.error('Error', error);
      }
    };
    fetchData();
  }, []);

  const [weeklyUsage, setWeeklyUsage] = useState<number | null>(null);
  const [weeklyUsageTrend, setWeeklyUsageTrend] = useState<number | null>(null);
  const [thisWeek, setThisWeek] = useState<WeeklyTotal | null>(null);
  const [lastWeek, setLastWeek] = useState<WeeklyTotal | null>(null);

  const fetchWeeklyTotal = async () => {
    let weeklyTotals: WeeklyTotal[] = [];
    try {
      weeklyTotals = (await apiClient.get('/data/weekly-total')).data;
      return weeklyTotals;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      return []; // Return empty array instead of undefined
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weeklyTotals = await fetchWeeklyTotal();

        const lastWeek = weeklyTotals[0];
        const thisWeek = weeklyTotals[1];
        const percentageIncrease =
          ((thisWeek.total - lastWeek.total) / lastWeek.total) * 100;

        setWeeklyUsageTrend(percentageIncrease);
        setWeeklyUsage(weeklyTotals[1].total);
        setLastWeek(lastWeek);
        setThisWeek(thisWeek);
      } catch (error) {
        console.error('Error processing weekly totals:', error);
      }
    };

    fetchData();
  }, []);

  const [carbonIntensity, setCarbonIntensity] =
    useState<CarbonIntensity | null>(null);

  const fetchCarbonIntensity = async () => {
    let carbonIntensity: CarbonIntensity;
    try {
      carbonIntensity = (await apiClient.get('/external/carbon-intensity'))
        .data;
      return carbonIntensity;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carbonIntensity = await fetchCarbonIntensity();
        setCarbonIntensity(carbonIntensity);
      } catch (error) {
        console.error('Error processing weekly totals:', error);
      }
    };

    fetchData();
  }, []);

  const energyTariff = 23;
  const energyTariffTrend = +50;

  const [devices, setDevices] = useState<Device[]>([]);
  const [lastUsages, setLastUsages] = useState<LastUsage>({});
  const [currentTotalUsage, setCurrentTotalUsage] = useState<number>(0);

  useEffect(() => {
    const fetchDevices = async () => {
      let deviceResponse: Device[] = [];

      try {
        deviceResponse = (await apiClient.get('/devices/')).data;
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        return;
      }

      try {
        const usageResponse: LastUsage = (
          await apiClient.get('/data/last_usage')
        ).data;
        setLastUsages(usageResponse);
        deviceResponse.forEach((device) => {
          const hardwareName = device.hardware_name;
          if (usageResponse[hardwareName]) {
            device.last_usage = usageResponse[hardwareName].last_usage;
          }
        });
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      }

      setDevices(deviceResponse);
    };

    fetchDevices();
    // const interval = setInterval(fetchDevices, 30000);
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const totalUsage: number = Object.values(lastUsages).reduce(
      (sum, hardware) => sum + hardware.last_usage,
      0,
    );
    setCurrentTotalUsage(totalUsage);
  }, [lastUsages]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* <h2>Hi {firstName}!</h2> */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <CurrentUsageCard last_usage={currentTotalUsage} />
          {weeklyUsage && weeklyUsageTrend && lastWeek && thisWeek ? (
            <WeeklyUsageCard
              weeklyUsage={weeklyUsage}
              weeklyUsageTrend={weeklyUsageTrend}
              thisWeek={thisWeek}
              lastWeek={lastWeek}
            />
          ) : (
            <SkeletonCard />
          )}
          {carbonIntensity ? (
            <CarbonIntensityCard carbonIntensity={carbonIntensity} />
          ) : (
            <SkeletonCard />
          )}
          <EnergyTariffCard
            energyTariff={energyTariff}
            energyTariffTrend={energyTariffTrend}
          />
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
