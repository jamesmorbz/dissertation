import SchedulePage from "@/components/scheduler/SchedulePage";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/scheduler')({
  component: SchedulePage,
})