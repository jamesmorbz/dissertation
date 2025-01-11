import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import { userService } from '@/services/user';
import { Toaster } from '@/components/ui/toaster';

const passwordFormSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: 'Current password is required.' }),
    new_password: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters.' }),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords must match.',
  });

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const defaultValues: PasswordFormValues = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

export function PasswordForm() {
  const { toast } = useToast();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    mode: 'onChange',
    defaultValues, // Initialize with empty strings
  });

  async function onSubmit(data: PasswordFormValues) {
    try {
      await userService.changePassword(data);
      toast({
        title: 'Password Changed Successfully',
        description: 'Your password has been updated.',
      });
      form.reset(defaultValues); // Reset form after successful submission
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="current_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your current account password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your new password must be at least 8 characters long.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retype New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Retype your new password to confirm.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Change Password</Button>
      </form>
      <Toaster />
    </Form>
  );
}
