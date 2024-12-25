import { Link } from 'react-router-dom';
import { CircleUser, Menu, HousePlug } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { DeviceCard } from '@/components/dashboard/device-card';
import { CurrentUsageCard } from '@/components/dashboard/current-usage-card';
import { WeeklyUsageCard } from '@/components/dashboard/weekly-usage-card';
import { CarbonIntensityCard } from '@/components/dashboard/carbon-intensity-card';
import { EnergyTariffCard } from '@/components/dashboard/energy-tariff-card';

export const description =
  'An application shell with a header and main content area. The header has a navbar, a search input and and a user nav dropdown. The user nav is toggled by a button with an avatar image. The main content area is divided into two rows. The first row has a grid of cards with statistics. The second row has a grid of cards with a table of recent transactions and a list of recent sales.';

export const iframeHeight = '730px';

export const containerClassName = 'w-full h-full';

export function Dashboard() {
  const overviewChartTags = ['bedroom', 'kitchen'];
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
    { date: '2024-12-18', bedroom: 364, kitchen: 1000 },
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

  const currentUsage: number = 243;

  const weeklyUsage: number = 1255;
  const weeklyUsageTrend: number = +5;

  const carbonIntensity: number = 72;
  const cleanEnergy: boolean = true;

  const energyTariff = 23;
  const energyTariffTrend = +50;

  const devices = [
    {
      hardware_name: 'tasmota_XXX000',
      friendly_name: 'BedroomPlug1',
      tag: 'Bedroom,Computer',
      status: 'ONLINE',
      current_usage: '5W',
    },
    {
      hardware_name: 'tasmota_XXX001',
      friendly_name: 'BedroomPlug2',
      tag: 'Bedroom,Hairdryer',
      status: 'OFFLINE',
      current_usage: '10W',
    },
    {
      hardware_name: 'tasmota_XXX003',
      friendly_name: null,
      tag: 'Bedroom,Charger',
      status: 'ONLINE',
      current_usage: '15W',
    },
  ];

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/devices', label: 'Devices' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/automation', label: 'Automation' },
    { to: '/logs', label: 'Logs' },
    { to: '/faqs', label: 'FAQs' },
  ];
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        {/* Desktop Navigation */}
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            to="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <HousePlug className="h-6 w-6" />
          </Link>
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                to="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <HousePlug className="h-6 w-6" />
              </Link>
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-4 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  to="/settings"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <CurrentUsageCard currentUsage={currentUsage} />
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
          <OverviewChart
            overviewChartData={overviewChartData}
            overviewChartTags={overviewChartTags}
          />
          <DeviceCard devices={devices} />
        </div>
      </main>
    </div>
  );
}
