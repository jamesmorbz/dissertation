import { useState } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

export const AnalyticsForm = () => {
  const [selectedLocation, setSelectedLocation] = useState('');

  const form = useForm({
    defaultValues: {
      location: '',
      energyProvider: '',
      octopusPrivateKey: '',
    },
  });

  const watchProvider = form.watch('energyProvider');

  function handleLocationSelect(location: string) {
    setSelectedLocation(location);
    form.setValue('location', location);
  }

  function onSubmit(data) {
    console.log('Analytics data submitted:', data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          name="energyProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Energy Provider</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an energy provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Octopus">Octopus</SelectItem>
                    <SelectItem value="EOn">E.ON</SelectItem>
                    <SelectItem value="EDF">EDF</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Select your energy provider</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchProvider && watchProvider !== 'none' && (
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
        )}

        <Button type="submit">Update Analytics</Button>
      </form>
    </Form>
  );
};
