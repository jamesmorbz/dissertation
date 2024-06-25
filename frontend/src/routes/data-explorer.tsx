import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/data-explorer")({
  component: () => <div>Hello /data-explorer!</div>,
});
