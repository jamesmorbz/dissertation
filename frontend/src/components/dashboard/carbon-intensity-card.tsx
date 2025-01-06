import { Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CarbonIntensity, carbonIntensityIndex } from '@/types/data-point';

interface CarbonIntensityCardProps {
  carbonIntensity: CarbonIntensity;
}

interface IntensityConfig {
  color: string;
  tagline: string;
}
const intensityMapping: Record<carbonIntensityIndex, IntensityConfig> = {
  'very low': {
    color: '#2ECC71', // green
    tagline:
      'The grid is super clean! Perfect time to charge all your devices!',
  },
  low: {
    color: '#3498DB', // blue
    tagline: 'The grid is clean now! This is a great time to charge devices!',
  },
  moderate: {
    color: '#F1C40F', // yellow
    tagline:
      'Average grid intensity. Consider delaying non-essential energy use if possible.',
  },
  high: {
    color: '#E67E22', // orange
    tagline: 'High carbon intensity. Try to minimize energy usage if you can.',
  },
  'very high': {
    color: '#E74C3C', // red
    tagline: 'Wait! Try to avoid using energy, the grid will be greener soon!',
  },
};

const CarbonIntensityCard: React.FC<CarbonIntensityCardProps> = ({
  carbonIntensity,
}) => {
  const carbonIntensityUnit: JSX.Element = (
    <span>
      gCO<sub>2</sub>/kWh
    </span>
  );
  const intensityCard = intensityMapping[carbonIntensity.intensity.index];

  return (
    <Card x-chunk="A card showing the total revenue in USD and the percentage difference from last month.">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Current Carbon Intensity
        </CardTitle>
        <Leaf
          className="h-5 w-5 text-muted-foreground"
          color={intensityCard.color}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {carbonIntensity.intensity.actual}
          {carbonIntensityUnit}
        </div>
        <p className="text-xs text-muted-foreground">{intensityCard.tagline}</p>
      </CardContent>
    </Card>
  );
};

export { CarbonIntensityCard };
