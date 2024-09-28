import { Card, Group, Text } from '@mantine/core';
import * as classes from './styles.css';

interface DeviceOnlineCardProps {
  devices_online: number;
  devices_registered: number;
}

export function DeviceOnlineCard({
  devices_online,
  devices_registered,
}: DeviceOnlineCardProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={classes.card}
    >
      <Group style={{ marginBottom: 5 }}>
        <Text size="lg">Devices Online: {devices_online}</Text>
        <Text size="xs">Devices Registered: {devices_registered}</Text>
      </Group>
    </Card>
  );
}
