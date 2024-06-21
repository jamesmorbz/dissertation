import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/scheduler')({
  component: () => <div>Hello /scheduler!</div>
})