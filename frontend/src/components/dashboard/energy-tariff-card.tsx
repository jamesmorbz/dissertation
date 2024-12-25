import { Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnergyTariffCardProps {
  energyTariff: number;
  energyTariffTrend: number;
}

const EnergyTariffCard: React.FC<EnergyTariffCardProps> = ({
  energyTariff,
  energyTariffTrend,
}) => {
  const energyTariffUnit: JSX.Element = <span>p/kWh</span>;
  const statusColor: string = energyTariffTrend < 0 ? 'green' : 'red';
  const tagline: string =
    energyTariffTrend < 0 ? `${energyTariffTrend}` : `+${energyTariffTrend}`;

  return (
    <Card x-chunk="A card showing the total revenue in USD and the percentage difference from last month.">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Current Energy Tariff
        </CardTitle>
        <Banknote
          className="h-5 w-5 text-muted-foreground"
          color={statusColor}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {energyTariff}
          {energyTariffUnit}
        </div>
        <p className="text-xs text-muted-foreground">
          {tagline}% compared to 24h ago
        </p>
      </CardContent>
    </Card>
  );
};

export { EnergyTariffCard };
