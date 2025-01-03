import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  username: 'admin',
  email: 'admin@b.com',
};

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [savedProfilePicture, setSavedProfilePicture] = useState<File | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  function handleProfilePictureChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] || null;
    if (file) {
      setProfilePicture(file);
    }
  }

  async function handleSaveProfilePicture() {
    if (!profilePicture) return;

    setIsLoading(true);
    try {
      // Here you would typically upload the file to your server
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSavedProfilePicture(profilePicture);
      toast({
        title: 'Profile Picture Saved',
        description: 'Your new profile picture has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to save profile picture. Please try again. Error: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveProfilePicture() {
    setIsLoading(true);
    try {
      // Here you would typically delete the file from your server
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setProfilePicture(null);
      setSavedProfilePicture(null);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        (fileInput as HTMLInputElement).value = '';
      }

      toast({
        title: 'Profile Picture Removed',
        description: 'Your profile picture has been removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to remove profile picture. Please try again. Error: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeactivate() {
    toast({
      title: 'Account Deactivated',
      description:
        'Your account has been successfully deactivated. You will be logged out shortly.',
      variant: 'destructive',
    });
    setTimeout(() => {
      navigate('/');
    }, 2000);
  }

  return (
    <>
      <Form {...form}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            disabled={true}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  In order to change this please contact support.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            disabled={true}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  In order to change this please contact support.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Profile Picture</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  {(savedProfilePicture || profilePicture) && (
                    <Button
                      variant="outline"
                      onClick={handleRemoveProfilePicture}
                      type="button"
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {profilePicture && profilePicture !== savedProfilePicture && (
                  <div className="flex items-center gap-4">
                    <div className="flex-grow">
                      <img
                        src={URL.createObjectURL(profilePicture)}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Preview
                      </p>
                    </div>
                    <Button
                      onClick={handleSaveProfilePicture}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save New Picture'}
                    </Button>
                  </div>
                )}
                {savedProfilePicture &&
                  (!profilePicture ||
                    profilePicture === savedProfilePicture) && (
                    <div>
                      <img
                        src={URL.createObjectURL(savedProfilePicture)}
                        alt="Current profile picture"
                        className="h-24 w-24 rounded-full object-cover border"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Current picture
                      </p>
                    </div>
                  )}
              </div>
            </FormControl>
            <FormDescription>
              Upload a profile picture in JPG, PNG or GIF format.
            </FormDescription>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Account Management</FormLabel>
            <FormControl>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button">
                    Deactivate Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Deactivating your account will log you out. In order to
                      re-activate an account you must re-verify your email.
                      Deactivated accounts will be deleted after 30 days.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeactivate}>
                      Deactivate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </FormControl>
            <FormDescription>
              This action cannot be undone. Please be certain.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </div>
      </Form>
      <Toaster />
    </>
  );
}

export default ProfileForm;
