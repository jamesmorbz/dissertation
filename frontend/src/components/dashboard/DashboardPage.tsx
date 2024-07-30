import { Chart, DataProps } from './Chart';
import axios from 'axios';
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

  useEffect(() => {
    const getDevices = async () => {
      try {
        const response = await axios.get<Device[]>(
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
        const response = await axios.get<DataProps>(
          `http://localhost:8000/data/device/${selectedDevice}?lookback=6h`,
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
  }, [selectedDevice]);

  return (
    <div>
      <Select
        label="Select Device"
        value={selectedDevice}
        onChange={(value) => setSelectedDevice(value as string)}
        data={devices.map((device) => ({
          value: device.hardware_name,
          label: device.friendly_name,
        }))}
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
        <DeviceOnlineCard devices_online={devices.length}></DeviceOnlineCard>
        <DeviceOnlineCard devices_online={devices.length}></DeviceOnlineCard>
        <DeviceOnlineCard devices_online={devices.length}></DeviceOnlineCard>
        <DeviceOnlineCard devices_online={devices.length}></DeviceOnlineCard>
      </SimpleGrid>
    </div>
  );
}

export default DashboardPage;
