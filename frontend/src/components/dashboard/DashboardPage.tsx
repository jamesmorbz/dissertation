import { Chart, DataProps } from './Chart';
import apiClient from '../../helpers/api-client';
import React, { useEffect, useState } from 'react';
import { Card, SimpleGrid, Stack, Title, Select } from '@mantine/core';
import { DeviceOnlineCard } from './DeviceOnlineCard';
interface Device {
  hardware_name: string;
  friendly_name: string;
  tag: string;
}

function DashboardPage() {
  const [data, setData] = useState<DataProps | null>(null);
  const [lastPoll, setLastPoll] = useState<string>(new Date().toISOString());
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [lookback, setLookbackOption] = useState<string>('30m');
  const [interval, setIntervalOption] = useState<string>('1m');

  const lookback_options = ['1m', '10m', '1h', '6h', '12h', '24h', '2d', '7d'];
  const interval_options = ['5s', '1m', '10m', '30m', '1h'];

  useEffect(() => {
    const getDevices = async () => {
      try {
        const response = await apiClient.get<Device[]>(
          'http://localhost:8000/devices',
        );
        setDevices(response.data);
        if (response.data.length > 0) {
          setSelectedDevice(response.data[0].hardware_name);
        }
      } catch (error) {
        console.error('Error fetching devices', error);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;

    const fetchData = async () => {
      try {
        const response = await apiClient.get<DataProps>(
          `http://localhost:8000/data/device/${selectedDevice}?lookback=${lookback}&interval=${interval}`,
        );
        setData(response.data);
        setLastPoll(new Date().toISOString());
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();

    const intervalId = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [selectedDevice, interval, lookback]);

  return (
    <div>
      <Select
        label="Select Device"
        value={selectedDevice}
        onChange={(value) => setSelectedDevice(value as string)}
        data={devices.map((device) => ({
          value: device.hardware_name,
          label: `${device.friendly_name} (${device.hardware_name})`,
        }))}
      />
      <Select
        label="Select Lookback"
        value={lookback}
        onChange={(value) => setLookbackOption(value as string)}
        data={lookback_options}
      />
      <Select
        label="Select Interval"
        value={interval}
        onChange={(value) => setIntervalOption(value as string)}
        data={interval_options}
      />
      <h3>{selectedDevice}</h3>
      {data ? <Chart {...data} /> : <p>Loading data...</p>}
      <div>Last Updated: {lastPoll}</div>
      <SimpleGrid
        cols={4}
        spacing="md"
        p="md"
        h="100%" // TODO: 50% w/ cols 4
        style={{ overflow: 'hidden' }}
      >
        <DeviceOnlineCard
          devices_online={devices.length}
          devices_registered={devices.length}
        ></DeviceOnlineCard>
        <DeviceOnlineCard
          devices_online={devices.length}
          devices_registered={devices.length}
        ></DeviceOnlineCard>
        <DeviceOnlineCard
          devices_online={devices.length}
          devices_registered={devices.length}
        ></DeviceOnlineCard>
        <DeviceOnlineCard
          devices_online={devices.length}
          devices_registered={devices.length}
        ></DeviceOnlineCard>
      </SimpleGrid>
    </div>
  );
}

export default DashboardPage;
