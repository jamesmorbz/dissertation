import { Card, SimpleGrid, Stack, Title } from "@mantine/core";
import { Device } from "./Device";

function DevicesPage() {
  // Example device data
  const devices = [
    {
      name: "Device 1",
      hardware_name: "ESP8266",
      device_type: "Sensor",
      status: "online",
      last_updated: "2023-06-14T12:34:56Z",
      uptime_seconds: 123456,
      wifi_ssid: "Home_Network",
      wifi_rssi: "-70",
    },
    {
      name: "Device 2",
      hardware_name: "Raspberry Pi",
      device_type: "Controller",
      status: "offline",
      last_updated: "2023-06-14T10:20:30Z",
      uptime_seconds: null,
      wifi_ssid: "Office_Network",
      wifi_rssi: "-50",
    },
    {
      name: "Device 3",
      hardware_name: "Arduino",
      device_type: "Actuator",
      status: "online",
      last_updated: "2023-06-14T14:45:00Z",
      uptime_seconds: 234567,
      wifi_ssid: "Lab_Network",
      wifi_rssi: "-70",
    },
    {
      name: "Device 4",
      hardware_name: "ESP32",
      device_type: "Sensor",
      status: "online",
      last_updated: "2023-06-14T15:30:00Z",
      uptime_seconds: 345678,
      wifi_ssid: "Field_Network",
      wifi_rssi: "-230",
    },
  ];

  return (
    <SimpleGrid
      cols={2}
      spacing="md"
      p="md"
      h="100%"
      style={{ overflow: "hidden" }}
    >
      {devices.map((device, index) => (
        <Card key={index}>
          <Device {...device} />
        </Card>
      ))}
    </SimpleGrid>
  );
}

export default DevicesPage;
