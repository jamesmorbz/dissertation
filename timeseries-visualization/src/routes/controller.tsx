import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/controller')({
  component: () => <div>Hello /controller!</div>
})