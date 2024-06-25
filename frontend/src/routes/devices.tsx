import DevicesPage from "@/components/devices/DevicesPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/devices")({
  component: DevicesPage,
});
