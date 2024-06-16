import {
    ActionIcon,
    Card,
    Group,
    Loader,
    Progress,
    Stack,
    Text,
    Badge
  } from "@mantine/core";
  import {
    IconRefresh,
    IconX,
    IconPlug,
    IconCheck,
    IconDeviceMobile,
    IconWifi,
    IconClock,
    IconSignalE,
    IconPower
  } from "@tabler/icons-react";
  import { useState } from "react";
  import * as classes from "./styles.css";
  
  interface DeviceProps {
    name: string;
    hardware_name: string;
    device_type: string;
    status: string;
    last_updated: string;
    uptime_seconds: number | null;
    wifi_ssid: string;
    wifi_rssi: string;
  }
  
export function Device({
    name,
    hardware_name,
    device_type,
    status,
    last_updated,
    uptime_seconds,
    wifi_ssid,
    wifi_rssi,
  }: DeviceProps) {
  
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
  
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.card}>
        <Group style={{ marginBottom: 5 }}>
          <Text size="lg">{name}</Text>
          <Badge color={status === 'online' ? 'green' : 'red'}>
            {status === 'online' ? <IconCheck size={14} /> : <IconX size={14} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </Group>
  
        <Stack>
          <Group>
            <IconDeviceMobile size={16} />
            <Text>{hardware_name}</Text>
          </Group>
          <Group>
            <IconPlug size={16} />
            <Text>{device_type}</Text>
          </Group>
          <Group>
            <IconClock size={16} />
            <Text>Uptime: {uptime_seconds !== null ? `${uptime_seconds} seconds` : 'N/A'}</Text>
          </Group>
          <Group>
            <IconWifi size={16} />
            <Text>SSID: {wifi_ssid}</Text>
          </Group>
          <Group>
            <IconSignalE size={16} />
            <Text>RSSI: {wifi_rssi} dBm</Text>
          </Group>
          {loading && <Loader size="sm" />}
          {progress !== null && <Progress value={progress} />}
        </Stack>
  
        <Group>
          <ActionIcon onClick={() => setLoading(!loading)}>
            <IconPower size={18} />
          </ActionIcon>
        </Group>

        <Text mt="xs" size="xs" c="dimmed" ta="right">
        <IconClock size={16} />
            Last Updated: {new Date(last_updated).toLocaleString()}
        </Text>
        

      </Card>
    );
  }
