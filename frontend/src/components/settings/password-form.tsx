import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
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

// Define the schema for the password form
const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Current password is required.' }),
    newPassword: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'], // Point to the confirmPassword field
    message: 'Passwords must match.',
  });

// Infer form values type from the schema
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function PasswordForm() {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    mode: 'onChange',
  });

  function onSubmit(data: PasswordFormValues) {
    toast({
      title: 'Password Changed Successfully',
      description: 'Your password has been updated.',
    });
    console.log('Password data submitted:', data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retype New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
    </Form>
  );
}
