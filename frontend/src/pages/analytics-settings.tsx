import { Separator } from '@/components/ui/separator';
import { AnalyticsForm } from '@/components/settings/analytics-form';

export default function AnalyticsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Customize your data flow for the application
        </p>
      </div>
      <Separator />
      <AnalyticsForm />
    </div>
  );
}
