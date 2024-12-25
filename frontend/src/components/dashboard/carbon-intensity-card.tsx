import { Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CarbonIntensityCardProps {
  carbonIntensity: number;
  cleanEnergy: boolean;
}

const CarbonIntensityCard: React.FC<CarbonIntensityCardProps> = ({
  carbonIntensity,
  cleanEnergy,
}) => {
  const carbonIntensityUnit: JSX.Element = (
    <span>
      gCO<sub>2</sub>/kWh
    </span>
  );
  const statusColor: string = cleanEnergy ? 'green' : 'red';
  const tagline: string = cleanEnergy
    ? 'The grid is clean now! This is a great time to charge devices!'
    : 'Wait! Try to avoid using energy, the grid will be greener soon!';

  return (
    <Card x-chunk="A card showing the total revenue in USD and the percentage difference from last month.">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Current Carbon Intensity
        </CardTitle>
        <Leaf className="h-5 w-5 text-muted-foreground" color={statusColor} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {carbonIntensity}
          {carbonIntensityUnit}
        </div>
        <p className="text-xs text-muted-foreground">{tagline}</p>
      </CardContent>
    </Card>
  );
};

export { CarbonIntensityCard };
