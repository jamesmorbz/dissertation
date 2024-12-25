import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CircleCheck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const DeviceCard = ({ devices }) => {
  return (
    <Card x-chunk="A card showing your devices">
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <p className="text-xs text-muted-foreground"> 2 Online, 1 Offline </p>
      </CardHeader>
      <CardContent className="grid gap-8">
        {devices.map((device) => (
          <div className="flex items-center gap-4" key={device.friendly_name}>
            {device.status == 'ONLINE' ? (
              <CircleCheck color="green" />
            ) : (
              <AlertCircle color="red" />
            )}
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {device.friendly_name || device.hardware_name}
              </p>
              <p className="text-sm text-muted-foreground">{device.tag}</p>
            </div>
            <div className="ml-auto font-medium">{device.current_usage}</div>
          </div>
        ))}
      </CardContent>
      <Button asChild size="sm" className="ml-auto gap-1">
        <Link to="#">
          View All
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
};

export { DeviceCard };
