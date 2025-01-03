import { ChartNoAxesCombined } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyUsageCardProps {
  weeklyUsage: number;
  weeklyUsageTrend: number;
}

const WeeklyUsageCard: React.FC<WeeklyUsageCardProps> = ({
  weeklyUsage,
  weeklyUsageTrend,
}) => {
  const statusColor: string = weeklyUsageTrend < 0 ? 'green' : 'red';
  const tagline: string =
    weeklyUsageTrend < 0 ? `${weeklyUsageTrend}` : `+${weeklyUsageTrend}`;

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
        <div className="text-2xl font-bold">{weeklyUsage}W</div>
        <p className="text-xs text-muted-foreground">
          {tagline}% from last month
        </p>
      </CardContent>
    </Card>
  );
};

export { WeeklyUsageCard };
