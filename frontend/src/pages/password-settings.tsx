import { Separator } from '@/components/ui/separator';
import { PasswordForm } from '@/components/settings/password-form';

export default function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Change Password</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the app. Automatically switch between day
          and night themes.
        </p>
      </div>
      <Separator />
      <PasswordForm />
    </div>
  );
}
