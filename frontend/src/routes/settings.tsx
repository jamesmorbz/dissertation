import SettingsPage from '@/components/settings/SettingsPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});
