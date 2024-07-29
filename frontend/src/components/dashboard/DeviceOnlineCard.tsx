import { Card, Group, Text } from '@mantine/core';
import * as classes from './styles.css';

interface DeviceOnlineCardProps {
  devices_online: number;
}

export function DeviceOnlineCard({ devices_online }: DeviceOnlineCardProps) {
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
      </Group>
    </Card>
  );
}
