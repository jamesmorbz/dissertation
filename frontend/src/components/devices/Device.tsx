import {
  ActionIcon,
  Card,
  Group,
  Loader,
  Progress,
  Stack,
  Text,
  Badge,
} from '@mantine/core';
import {
  IconRefresh,
  IconX,
  IconPlug,
  IconCheck,
  IconDeviceMobile,
  IconWifi,
  IconClock,
  IconSignalE,
  IconPower,
} from '@tabler/icons-react';
import * as classes from './styles.css';
import axios from 'axios';

export interface DeviceProps {
  friendly_name: string;
  hardware_name: string;
  device_type: string;
  power: boolean;
  timestamp: string;
  uptime: number | null;
  wifi_name: string;
  wifi_rssi: number;
  wifi_signal: number;
}

async function togglePower(hardware_name: string) {
  try {
    console.log(
      `Calling http://127.0.0.1:8000/controller/${hardware_name}/TOGGLE_POWER`,
    );
    const response = await axios.put(
      `http://127.0.0.1:8000/controller/${hardware_name}/TOGGLE_POWER`,
    ); // Could pop up a toast notification?
    // In future this could become a POST with a {"COMMAND": "TOGGLE_POWER"} as we could extend
    // the device/XXXXXX/ endpoint to not only power on and off the plug but do other things (like update message interval)
  } catch (error) {
    console.error('Error Calling Endpoint', error);
  }
}

export function Device({
  friendly_name,
  hardware_name,
  device_type,
  power,
  timestamp,
  uptime,
  wifi_name,
  wifi_rssi,
}: DeviceProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={classes.card}
    >
      <Group style={{ marginBottom: 5 }}>
        <Text size="lg">{friendly_name}</Text>
        <Badge color={power ? 'green' : 'red'}>
          {power ? <IconCheck size={14} /> : <IconX size={14} />}
          {power ? 'ON' : 'OFF'}
        </Badge>
      </Group>

      <Stack>
        <Group>
          <IconDeviceMobile size={16} />
          <Text>{hardware_name}</Text>
        </Group>
        {/* TODO - Add this enrichment <Group>
          <IconPlug size={16} />
          <Text>??</Text>
        </Group> */}
        <Group>
          <IconClock size={16} />
          <Text>Uptime: {uptime !== null ? `${uptime} seconds` : 'N/A'}</Text>
        </Group>
        <Group>
          <IconWifi size={16} />
          <Text>SSID: {wifi_name}</Text>
        </Group>
        <Group>
          <IconSignalE size={16} />
          <Text>RSSI: {wifi_rssi} dBm</Text>
        </Group>
      </Stack>

      <Group className={classes.powerIcon}>
        <ActionIcon onClick={() => togglePower(hardware_name)}>
          <IconPower size={20} />
        </ActionIcon>
        <ActionIcon onClick={() => console.log('force refresh device power')}>
          <IconRefresh size={20} />
        </ActionIcon>
      </Group>

      <Text className={classes.lastUpdated}>
        <IconClock size={20} />
        Last Updated: {new Date(timestamp).toLocaleString()}
      </Text>
    </Card>
  );
}
