import { Card, SimpleGrid, Stack, Title } from "@mantine/core";
import { Device, DeviceProps } from "./Device";
import React, { useEffect, useState } from "react";
import axios from "axios";

function DevicesPage() {
  const [devices, setDevices] = useState<DeviceProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<DeviceProps[]>(
          "http://127.0.0.1:8000/devices"
        );
        setDevices(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();

    const intervalId = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  return (
    <SimpleGrid
      cols={2}
      spacing="md"
      p="md"
      h="100%" // TODO: 50% w/ cols 4
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
