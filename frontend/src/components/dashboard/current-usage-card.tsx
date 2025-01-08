import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ErrorCard } from '@/components/shared/error-card';
import { SkeletonCard } from '@/components/shared/skeleton-card';

interface CurrentUsageCardProps {
  last_usage: number | null;
  onRefresh: () => void;
}

const CurrentUsageCard: React.FC<CurrentUsageCardProps> = ({
  last_usage,
  onRefresh,
}) => {
  const [showError, setShowError] = useState(false);

  const buttonClick = () => {
    setShowError(false);
    onRefresh();
  };

  const getFormattedTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const [time] = useState<string>(getFormattedTime());

  useEffect(() => {
    const timer = setTimeout(() => {
      if (last_usage === null) {
        setShowError(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [last_usage, showError]);

  useEffect(() => {
    if (last_usage !== null) {
      setShowError(false);
    }
  }, [last_usage]);

  if (showError) {
    return (
      <ErrorCard
        title="Current Energy Usage"
        icon={<Zap className="h-5 w-5 text-muted-foreground" color="purple" />}
        onRefresh={buttonClick}
      />
    );
  }

  if (last_usage === null) {
    return <SkeletonCard />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Current Energy Usage
        </CardTitle>
        <Zap className="h-5 w-5 text-muted-foreground" color="purple" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{last_usage}W</div>
        <p className="text-xs text-muted-foreground">Last Updated: {time}</p>
      </CardContent>
    </Card>
  );
};

export { CurrentUsageCard };
