import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/components/settings/profile-form';

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Change your profile picture
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}
