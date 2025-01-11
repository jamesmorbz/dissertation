import apiClient from '@/lib/api-client';
import { Device } from '@/types/device';

class DeviceService {
  getDevices() {
    return apiClient.get('/devices/');
  }

  getDeviceLastUsage() {
    return apiClient.get('/data/last_usage');
  }

  updateDevice(hardware_name: string, updates: Partial<Device>) {
    return apiClient.put(`/devices/${hardware_name}`, updates);
  }
}

export const deviceService = new DeviceService();
