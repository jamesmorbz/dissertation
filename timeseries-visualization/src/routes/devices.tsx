import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/devices')({
  component: () => <div>Hello /devices!</div>
})