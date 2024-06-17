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
  import * as classes from "./styles.css";
  import axios from "axios";

export interface DeviceProps {
    name: string;
    hardware_name: string;
    device_type: string;
    status: string;
    last_updated: string;
    uptime_seconds: number | null;
    wifi_ssid: string;
    wifi_rssi: string;
}
  

async function togglePower(hardware_name: string) {
    try {
      console.log(`Calling http://127.0.0.1:8000/device/${hardware_name}/TOGGLE_POWER`)
      const response = await axios.put(`http://127.0.0.1:8000/device/${hardware_name}/TOGGLE_POWER`); // Could pop up a toast notification?
      // In future this could become a POST with a {"COMMAND": "TOGGLE_POWER"} as we could extend
      // the device/XXXXXX/ endpoint to not only power on and off the plug but do other things (like update message interval)
    } catch (error) {
      console.error("Error Calling Endpoint", error);
    }
};

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
  
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.card}>
        <Group style={{ marginBottom: 5 }}>
          <Text size="lg">{name}</Text>
          <Badge color={status === 'ON' ? 'green' : 'red'}>
            {status === 'ON' ? <IconCheck size={14} /> : <IconX size={14} />}
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
        </Stack>
  
        <Group className={classes.powerIcon}>
          <ActionIcon onClick={() => togglePower(hardware_name)}>
            <IconPower size={20}/>
          </ActionIcon>
        </Group>

        <Text className={classes.lastUpdated}>
        <IconClock size={20} />
            Last Updated: {new Date(last_updated).toLocaleString()}
        </Text>
        
      </Card>
    );
  }
