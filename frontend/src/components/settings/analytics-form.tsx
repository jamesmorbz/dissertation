import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

const analyticsFormSchema = z
  .object({
    defaultLookback: z
      .string()
      .min(1, { message: 'Default lookback window is required.' }),
    location: z.string().min(1, { message: 'Location is required.' }),
    tariffIntegration: z.boolean(),
    energyProvider: z.string().optional(),
    octopusPrivateKey: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.tariffIntegration) {
        return data.energyProvider && data.octopusPrivateKey;
      }
      return true;
    },
    {
      path: ['tariffIntegration'],
      message:
        'Energy Provider and Octopus Private Key are required when Tariff Integration is enabled.',
    },
  );

// Infer form values type from the schema
type AnalyticsFormValues = z.infer<typeof analyticsFormSchema>;

export function AnalyticsForm() {
  const form = useForm<AnalyticsFormValues>({
    resolver: zodResolver(analyticsFormSchema),
    mode: 'onChange',
  });

  const tariffIntegration = useWatch({
    control: form.control,
    name: 'tariffIntegration',
  });
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  function handleLocationSelect(location: string) {
    setSelectedLocation(location);
    form.setValue('location', location);
  }
  //   handleLocationSelect("")

  function onSubmit(data: AnalyticsFormValues) {
    toast({
      title: 'Analytics Updated Successfully',
      description: 'Your analytics settings have been updated.',
    });
    console.log('Analytics data submitted:', data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="defaultLookback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Lookback Windows</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Specify the default lookback window for analytics.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Location</FormLabel>
          {selectedLocation && (
            <p className="text-sm text-gray-600 mt-2">
              Selected Location: {selectedLocation}
            </p>
          )}
          <FormDescription>Select your location on the map</FormDescription>
        </div>
        <FormField
          control={form.control}
          name="tariffIntegration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tariff Integration</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
              </FormControl>
              <FormDescription>
                Enable to integrate specific tariff details.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {tariffIntegration && (
          <>
            <FormField
              control={form.control}
              name="energyProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Energy Provider</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an energy provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Octopus">Octopus</SelectItem>
                        <SelectItem value="BritishGas">British Gas</SelectItem>
                        <SelectItem value="EDF">EDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Select your energy provider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="octopusPrivateKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Private Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the private API key for your Energy Provider
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Button type="submit">Update Analytics</Button>
      </form>
    </Form>
  );
}
