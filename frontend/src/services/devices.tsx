import apiClient from '@/lib/api-client';
import { LastUsage } from '@/types/data-point';
import { Device } from '@/types/device';

class DeviceService {
  getDevices() {
    return apiClient.get<Device[]>('/devices/');
  }

  getDeviceLastUsage() {
    return apiClient.get<LastUsage>('/data/last_usage');
  }

  updateDevice(hardware_name: string, updates: Partial<Device>) {
    return apiClient.put(`/devices/${hardware_name}`, updates);
  }
}

export const deviceService = new DeviceService();
