import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Device } from '@/types/device';
import { Button } from '@/components/ui/button';
import { Lookback, timeRanges } from '@/types/data-point';

interface DeviceUsageGraphProps {
  deviceUsageData: DeviceUsage[];
  devices: Device[];
  lookback: Lookback;
  setLookback: (range: Lookback) => void;
}

interface DeviceUsage {
  timestamp: string;
  [key: string]: string | number;
}

const colors = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#9333ea',
  '#ea580c',
  '#0891b2',
];

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const DeviceUsageGraph: React.FC<DeviceUsageGraphProps> = ({
  deviceUsageData,
  devices,
  lookback,
  setLookback,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div className="w-20" /> {/* Spacer */}
          <CardTitle>Power Usage Over Time</CardTitle>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={lookback === range ? 'default' : 'outline'}
                onClick={() => setLookback(range)}
                size="sm"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={deviceUsageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} />
            <YAxis />
            <Tooltip
              labelFormatter={formatTimestamp}
              formatter={(value) => [`${value}W`, '']}
            />
            <Legend />
            {devices.map((device, index) => (
              <Line
                key={device.hardware_name}
                type="monotone"
                dataKey={device.hardware_name}
                name={device.friendly_name || device.hardware_name}
                stroke={colors[index % colors.length]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
