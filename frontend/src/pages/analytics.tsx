import { Navbar } from '@/components/navbar/navbar';
import { DeviceUsageGraph } from '@/components/devices/device-usage-graph';
import { useState } from 'react';
import { Lookback } from '@/types/data-point';
import { Device } from '@/types/device';

export function Analytics() {
  const [lookback, setLookback] = useState<Lookback>('1H');

  const devices: Device[] = [
    {
      hardware_name: 'ESP32-001',
      friendly_name: 'Living Room Plug',
      room: 'Living Room',
      tag: 'SmartPlug',
      state: true,
      last_usage: 1623481200000, // Timestamp example
      uptime: 1209600, // Seconds (14 days)
      wifi_rssi: -45, // dBm
      wifi_signal: 85, // Percentage
      wifi_name: 'Home_WiFi',
    },
    {
      hardware_name: 'ESP8266-002',
      friendly_name: 'Bedroom Light',
      room: 'Bedroom',
      tag: 'SmartLight',
      state: false,
      last_usage: 1623577600000, // Timestamp example
      uptime: 864000, // Seconds (10 days)
      wifi_rssi: -55, // dBm
      wifi_signal: 75, // Percentage
      wifi_name: 'Home_WiFi',
    },
  ];

  const [filteredDevices, setFilteredDevices] = useState<Device[]>(devices);

  const usageData = Array.from(
    { length: 24 },
    (_, i) => {
      const date = new Date();
      date.setHours(i, 0, 0, 0);
      return {
        timestamp: date.toISOString(),
        ...devices.reduce(
          (acc, device) => ({
            ...acc,
            [device.hardware_name]: Math.floor(Math.random() * 100) + 20,
          }),
          {},
        ),
      };
    },
    [lookback],
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <p>Analytics Page</p>
      <div className="container mx-auto py-6">
        <DeviceUsageGraph
          deviceUsageData={usageData}
          devices={filteredDevices}
          lookback={lookback}
          setLookback={setLookback}
        />
      </div>
    </div>
  );
}
