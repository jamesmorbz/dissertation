import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceUsageGraph } from '@/components/devices/device-usage-graph';
import { DeviceCard } from '@/components/devices/device-card';
import { Device } from '@/types/device';
import { Lookback } from '@/types/data-point';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import apiClient from '@/lib/api-client';
import { LastUsage } from '@/types/data-point';

export function Devices() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      let deviceResponse: Device[] = [];

      try {
        deviceResponse = (await apiClient.get('/devices/')).data;
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        return;
      }

      try {
        const usageResponse: LastUsage = (
          await apiClient.get('/data/last_usage')
        ).data;
        deviceResponse.forEach((device) => {
          const hardwareName = device.hardware_name;
          if (usageResponse[hardwareName]) {
            device.last_usage = usageResponse[hardwareName].last_usage;
          }
        });
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      }

      setDevices(deviceResponse);
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);

  useEffect(() => {
    let filtered = devices;

    if (selectedRoom !== 'All') {
      filtered = filtered.filter((device) => device.room === selectedRoom);
    }

    if (selectedDevice) {
      filtered = filtered.filter(
        (device) => device.hardware_name === selectedDevice,
      );
    }

    setFilteredDevices(filtered);
  }, [devices, selectedRoom, selectedDevice]);

  const uniqueTags = Array.from(
    new Set(
      devices
        .map((device) => device.tag)
        .filter((tag): tag is string => tag !== null),
    ),
  );
  const uniqueRooms = Array.from(
    new Set(
      devices
        .map((device) => device.room)
        .filter((room): room is string => room !== null),
    ),
  );
  const roomTabs = ['All', ...uniqueRooms];

  const [lookback, setLookback] = useState<Lookback>('1H');

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

  const handleDeviceSelect = (hardware_name: string) => {
    setSelectedDevice((currentSelected) =>
      currentSelected === hardware_name ? null : hardware_name,
    );
  };

  const handlePowerToggle = (hardware_name: string) => {
    const device = devices.find(
      (device) => device.hardware_name === hardware_name,
    );
    setDevices(
      devices.map((d) =>
        d.hardware_name === hardware_name ? { ...d, power: !d.power } : d,
      ),
    );

    toast({
      title: !device?.power ? 'Device Powered On' : 'Device Powered Off',
      description: `${
        device?.friendly_name || device?.hardware_name
      } has been ${!device?.power ? 'turned on' : 'turned off'}.`,
      variant: !device?.power ? 'default' : 'destructive',
    });
  };

  const handleDeviceUpdate = (
    hardware_name: string,
    updates: Partial<Device>,
  ) => {
    const device = devices.find(
      (device) => device.hardware_name === hardware_name,
    );
    setDevices(
      devices.map((d) =>
        d.hardware_name === hardware_name ? { ...d, ...updates } : d,
      ),
    );

    toast({
      title: 'Device Updated',
      description: `${
        device?.friendly_name || device?.hardware_name
      } has been updated successfully.`,
      variant: 'default',
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <div className="container mx-auto py-6">
        <Tabs
          defaultValue={selectedRoom}
          className="space-y-4"
          onValueChange={setSelectedRoom}
        >
          <TabsList onClick={() => setSelectedDevice(null)}>
            {roomTabs.map((room) => (
              <TabsTrigger className="p-3" key={room} value={room}>
                {room}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={selectedRoom} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.hardware_name}
                  {...device}
                  last_usage={device.last_usage}
                  onPowerToggle={() => handlePowerToggle(device.hardware_name)}
                  onUpdate={(updates) =>
                    handleDeviceUpdate(device.hardware_name, updates)
                  }
                  existingRooms={uniqueRooms}
                  existingTags={uniqueTags}
                  onSelect={() => handleDeviceSelect(device.hardware_name)}
                />
              ))}
            </div>
            <DeviceUsageGraph
              deviceUsageData={usageData}
              devices={filteredDevices}
              lookback={lookback}
              setLookback={setLookback}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}
