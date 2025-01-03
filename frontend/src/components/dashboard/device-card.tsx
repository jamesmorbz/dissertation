import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck, AlertCircle, MinusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Device } from '@/types/device';

interface DeviceCardProps {
  devices: Array<Device>;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ devices }) => {
  const onlineDevicesCount = devices.filter(
    (device) => device.power === true,
  ).length;
  const idleDevicesCount = devices.filter(
    (device) => device.power === false,
  ).length;
  const offlineDevicesCount = devices.filter(
    (device) => device.power === null,
  ).length;

  const top5Devices: Array<Device> = devices
    .sort((a, b) => b.last_usage - a.last_usage)
    .slice(0, 5);

  return (
    <Card
      x-chunk="A card showing your devices"
      className="flex-col items-center"
    >
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <p className="text-xs text-muted-foreground">
          {' '}
          {devices.length} Devices: {onlineDevicesCount} Online -{' '}
          {idleDevicesCount} Idle - {offlineDevicesCount} Offline{' '}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {top5Devices.map((device) => (
          <div className="flex items-center gap-4" key={device.hardware_name}>
            {device.power === true ? (
              <CircleCheck className="text-green-500" />
            ) : device.power === false ? (
              <MinusCircle className="text-yellow-500" />
            ) : (
              <AlertCircle className="text-red-500" />
            )}
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none text-left">
                {device.friendly_name || device.hardware_name}
              </p>
              <p className="text-sm text-muted-foreground text-left">
                {device.tag || 'N/A'} ({device.room})
              </p>
            </div>
            <div className="ml-auto font-medium">{device.last_usage}</div>
          </div>
        ))}
      </CardContent>
      <Button asChild size="sm" className="gap-1 mt-auto mb-4">
        <Link to="/devices" className="flex items-center gap-1">
          View All Devices
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
};

export { DeviceCard };
