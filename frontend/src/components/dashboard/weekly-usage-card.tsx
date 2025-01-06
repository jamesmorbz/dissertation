import { ChartNoAxesCombined } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyTotal } from '@/types/data-point';

interface WeeklyUsageCardProps {
  weeklyUsage: number;
  weeklyUsageTrend: number;
  thisWeek: WeeklyTotal;
  lastWeek: WeeklyTotal;
}

const WeeklyUsageCard: React.FC<WeeklyUsageCardProps> = ({
  weeklyUsage,
  weeklyUsageTrend,
  thisWeek,
  lastWeek,
}) => {
  const statusColor: string = weeklyUsageTrend < 0 ? 'green' : 'red';
  const weeklyUsageTrendRounded: string = weeklyUsageTrend.toFixed(2);
  const tagline: string =
    weeklyUsageTrend < 0
      ? `${weeklyUsageTrendRounded}`
      : `+${weeklyUsageTrendRounded}`;

  return (
    <Card x-chunk="A card showing the total revenue in USD and the percentage difference from last month.">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Weekly Energy Usage
        </CardTitle>
        <ChartNoAxesCombined
          className="h-5 w-5 text-muted-foreground"
          color={statusColor}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {(weeklyUsage / 1000).toFixed(2)}kW
        </div>
        <p className="text-xs text-muted-foreground">{tagline}%</p>
        <p className="text-xs text-muted-foreground">
          {thisWeek.stop}-{thisWeek.start} vs {lastWeek.stop}-{lastWeek.start}
        </p>
      </CardContent>
    </Card>
  );
};

export { WeeklyUsageCard };
