import { ChartNoAxesCombined } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { SkeletonCard } from '../shared/skeleton-card';
import { ErrorCard } from '@/components/shared/error-card';

interface WeeklyTotal {
  start: string;
  stop: string;
}

interface WeeklyUsageCardProps {
  weeklyUsage: number | null;
  weeklyUsageTrend: number | null;
  thisWeek: WeeklyTotal | null;
  lastWeek: WeeklyTotal | null;
  onRefresh: () => void;
}

const WeeklyUsageCard: React.FC<WeeklyUsageCardProps> = ({
  weeklyUsage,
  weeklyUsageTrend,
  thisWeek,
  lastWeek,
  onRefresh,
}) => {
  const [showError, setShowError] = useState(false);

  const buttonClick = () => {
    setShowError(false);
    onRefresh();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        weeklyUsage === null ||
        weeklyUsageTrend === null ||
        !thisWeek ||
        !lastWeek
      ) {
        setShowError(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [weeklyUsage, weeklyUsageTrend, thisWeek, lastWeek, showError]);

  useEffect(() => {
    if (
      weeklyUsage !== null &&
      weeklyUsageTrend !== null &&
      thisWeek &&
      lastWeek
    ) {
      setShowError(false);
    }
  }, [weeklyUsage, weeklyUsageTrend, thisWeek, lastWeek]);

  if (showError) {
    return (
      <ErrorCard
        title="Weekly Energy Usage"
        icon={
          <ChartNoAxesCombined
            className="h-5 w-5 text-muted-foreground"
            color="black"
          />
        }
        onRefresh={buttonClick}
      />
    );
  }

  if (
    weeklyUsage === null ||
    weeklyUsageTrend === null ||
    !thisWeek ||
    !lastWeek
  ) {
    return <SkeletonCard />;
  }

  const statusColor = weeklyUsageTrend < 0 ? 'green' : 'red';
  const weeklyUsageTrendRounded = weeklyUsageTrend.toFixed(2);
  const tagline =
    weeklyUsageTrend < 0
      ? `${weeklyUsageTrendRounded}`
      : `+${weeklyUsageTrendRounded}`;

  return (
    <Card>
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
          {(weeklyUsage / 1000).toFixed(2)}kWh
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
