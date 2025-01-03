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
import { LastUsage } from '@/types/data-point';

export function Dashboard() {
  const overviewChartData = [
    { date: '2024-12-01', bedroom: 222, kitchen: 150 },
    { date: '2024-12-02', bedroom: 97, kitchen: 180 },
    { date: '2024-12-03', bedroom: 167, kitchen: 120 },
    { date: '2024-12-04', bedroom: 242, kitchen: 260 },
    { date: '2024-12-05', bedroom: 373, kitchen: 290 },
    { date: '2024-12-06', bedroom: 301, kitchen: 340 },
    { date: '2024-12-07', bedroom: 245, kitchen: 180 },
    { date: '2024-12-08', bedroom: 409, kitchen: 320 },
    { date: '2024-12-09', bedroom: 59, kitchen: 110 },
    { date: '2024-12-10', bedroom: 261, kitchen: 190 },
    { date: '2024-12-11', bedroom: 327, kitchen: 350 },
    { date: '2024-12-12', bedroom: 292, kitchen: 210 },
    { date: '2024-12-13', bedroom: 342, kitchen: 380 },
    { date: '2024-12-14', bedroom: 137, kitchen: 220 },
    { date: '2024-12-15', bedroom: 120, kitchen: 170 },
    { date: '2024-12-16', bedroom: 138, kitchen: 190 },
    { date: '2024-12-17', bedroom: 446, kitchen: 360 },
    { date: '2024-12-18', bedroom: 364, kitchen: 200 },
    { date: '2024-12-19', bedroom: 243, kitchen: 180 },
    { date: '2024-12-20', bedroom: 89, kitchen: 150 },
    { date: '2024-12-21', bedroom: 137, kitchen: 200 },
    { date: '2024-12-22', bedroom: 224, kitchen: 170 },
    { date: '2024-12-23', bedroom: 138, kitchen: 180 },
    { date: '2024-12-24', bedroom: 387, kitchen: 290 },
    { date: '2024-12-25', bedroom: 215, kitchen: 250 },
    { date: '2024-12-26', bedroom: 75, kitchen: 130 },
    { date: '2024-12-27', bedroom: 383, kitchen: 420 },
    { date: '2024-12-28', bedroom: 122, kitchen: 180 },
    { date: '2024-12-29', bedroom: 315, kitchen: 240 },
    { date: '2024-12-30', bedroom: 454, kitchen: 380 },
  ];

  const firstName: string = 'James';

  const last_usage: number = 243;

  const weeklyUsage: number = 1255;
  const weeklyUsageTrend: number = +5;

  const carbonIntensity: number = 72;
  const cleanEnergy: boolean = true;

  const energyTariff = 23;
  const energyTariffTrend = +50;

  const [devices, setDevices] = useState<Device[]>([]);

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
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* <h2>Hi {firstName}!</h2> */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <CurrentUsageCard last_usage={last_usage} />
          <WeeklyUsageCard
            weeklyUsage={weeklyUsage}
            weeklyUsageTrend={weeklyUsageTrend}
          />
          <CarbonIntensityCard
            carbonIntensity={carbonIntensity}
            cleanEnergy={cleanEnergy}
          />
          <EnergyTariffCard
            energyTariff={energyTariff}
            energyTariffTrend={energyTariffTrend}
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <OverviewChart overviewChartData={overviewChartData} />
          <DeviceCard devices={devices} />
        </div>
      </main>
    </div>
  );
}
