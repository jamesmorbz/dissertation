import { Device } from '@/types/device';

export type DeviceRule = {
  id: number;
  type: 'usage' | 'schedule' | 'energy_price' | 'carbon_intensity';
  enabled: boolean;
  action: 'turnOn' | 'turnOff';
  threshold?: number;
  time?: string;
  days?: string[];
  price_threshold?: number;
  intensity_level?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
};

export type DeviceWithRules = {
  device: Device;
  rules: DeviceRule[];
};
