import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/logs')({
  component: () => <div>Hello /logs!</div>
})