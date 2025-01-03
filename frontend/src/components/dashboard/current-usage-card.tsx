import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentUsageCardProps {
  last_usage: number;
}

const CurrentUsageCard: React.FC<CurrentUsageCardProps> = ({ last_usage }) => {
  return (
    <Card x-chunk="A card showing the total revenue in USD and the percentage difference from last month.">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Current Energy Usage
        </CardTitle>
        <Zap className="h-5 w-5 text-muted-foreground" color="purple" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{last_usage}W</div>
        <p className="text-xs text-muted-foreground">PUT CONTENT HERE</p>
      </CardContent>
    </Card>
  );
};

export { CurrentUsageCard };
