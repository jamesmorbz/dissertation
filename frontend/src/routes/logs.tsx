import { createFileRoute } from "@tanstack/react-router";
import LogsPage from "@/components/logs/LogsPage";

export const Route = createFileRoute("/logs")({
  component: LogsPage,
});
