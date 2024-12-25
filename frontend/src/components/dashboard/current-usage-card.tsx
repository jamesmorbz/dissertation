import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentUsageCardProps {
  currentUsage: number;
}

const CurrentUsageCard: React.FC<CurrentUsageCardProps> = ({
  currentUsage,
}) => {
  return (
    <Card x-chunk="A card showing the total revenue in USD and the percentage difference from last month.">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Current Energy Usage
        </CardTitle>
        <Zap className="h-5 w-5 text-muted-foreground" color="purple" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{currentUsage}</div>
        {/* <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p> */}
      </CardContent>
    </Card>
  );
};

export { CurrentUsageCard };
