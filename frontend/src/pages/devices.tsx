import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar/navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceCard } from '@/components/devices/device-card';
import { Device } from '@/types/device';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { LastUsage } from '@/types/data-point';
import { deviceService } from '@/services/devices';

export function Devices() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);

  const fetchDevices = useCallback(async () => {
    let deviceResponse: Device[] = [];
    try {
      deviceResponse = (await deviceService.getDevices()).data;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      return;
    }

    try {
      const usageResponse: LastUsage = (
        await deviceService.getDeviceLastUsage()
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
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const [selectedRoom, setSelectedRoom] = useState('All');
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);

  useEffect(() => {
    let filtered = devices;

    if (selectedRoom !== 'All') {
      filtered = filtered.filter((device) => device.room === selectedRoom);
    }

    setFilteredDevices(filtered);
  }, [devices, selectedRoom]);

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

  const handleDeviceUpdate = async (
    hardware_name: string,
    updates: Partial<Device>,
  ) => {
    try {
      await deviceService.updateDevice(`/devices/${hardware_name}`, updates);

      toast({
        title: 'Device Updated',
        description: `${
          updates.friendly_name || hardware_name
        } has been updated successfully.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to update usage:', error);
    }
    fetchDevices();
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
          <TabsList>
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
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}
