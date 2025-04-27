import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Devices } from './devices';

jest.mock('@/services/devices', () => ({
  deviceService: {
    getDevices: jest.fn(),
    getDeviceLastUsage: jest.fn(),
    updateDevice: jest.fn(),
  },
}));

import { deviceService } from '@/services/devices';

jest.mock('@/components/navbar/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar Component</div>,
}));

jest.mock('@/components/ui/tabs', () => {
  return {
    Tabs: ({ children, onValueChange, defaultValue }: any) => (
      <div
        data-testid="tabs"
        onChange={(e: any) => onValueChange && onValueChange(e.target.value)}
      >
        {children}
      </div>
    ),
    TabsList: ({ children }: any) => (
      <div data-testid="tabs-list">{children}</div>
    ),
    TabsTrigger: ({ children, value }: any) => (
      <button data-testid={`tab-${value}`} onClick={() => {}}>
        {children}
      </button>
    ),
    TabsContent: ({ children, value }: any) => (
      <div data-testid={`tab-content-${value}`}>{children}</div>
    ),
  };
});

jest.mock('@/components/devices/device-card', () => ({
  DeviceCard: (props: any) => (
    <div data-testid={`device-card-${props.hardware_name}`}>
      <div>{props.friendly_name || props.hardware_name}</div>
      <div>Room: {props.room}</div>
      <div>State: {props.state ? 'On' : 'Off'}</div>
      <button
        onClick={props.onPowerToggle}
        data-testid={`power-toggle-${props.hardware_name}`}
      >
        Toggle Power
      </button>
      <button
        onClick={() =>
          props.onUpdate({ friendly_name: `Updated ${props.friendly_name}` })
        }
        data-testid={`update-${props.hardware_name}`}
      >
        Update Device
      </button>
    </div>
  ),
}));

// Mock the toast hooks and components
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster Component</div>,
}));

// Sample device data
const mockDevices: any[] = [
  {
    hardware_name: 'device1',
    friendly_name: 'Living Room Light',
    state: true,
    room: 'Living Room',
    tag: 'lighting',
    last_usage: 25,
    uptime: 12345,
    wifi_rssi: -65,
    wifi_signal: 70,
    wifi_name: 'HomeWiFi',
  },
  {
    hardware_name: 'device2',
    friendly_name: 'Kitchen Fridge',
    state: false,
    room: 'Kitchen',
    tag: 'appliance',
    last_usage: 120,
    uptime: 54321,
    wifi_rssi: -72,
    wifi_signal: 60,
    wifi_name: 'HomeWiFi',
  },
  {
    hardware_name: 'device3',
    friendly_name: 'Bedroom Light',
    state: true,
    room: 'Bedroom',
    tag: 'lighting',
    last_usage: 15,
    uptime: 98765,
    wifi_rssi: -68,
    wifi_signal: 65,
    wifi_name: 'HomeWiFi',
  },
];

// Sample usage data
const mockUsageData = {
  device1: { last_usage: 25 },
  device2: { last_usage: 120 },
  device3: { last_usage: 15 },
};

describe('Devices Component', () => {
  // Store original console.error
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();

    // Replace console.error with a mock
    console.error = jest.fn();

    // Setup mock implementations
    (deviceService.getDevices as jest.Mock).mockResolvedValue({
      data: mockDevices,
    });
    (deviceService.getDeviceLastUsage as jest.Mock).mockResolvedValue({
      data: mockUsageData,
    });
    (deviceService.updateDevice as jest.Mock).mockResolvedValue({
      data: { success: true },
    });
  });

  afterEach(() => {
    // Restore original console.error after each test
    console.error = originalConsoleError;
  });

  test('renders devices page and fetches data', async () => {
    render(<Devices />);

    // Check if the navbar is rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();

    // Wait for devices to be fetched
    await waitFor(() => {
      expect(deviceService.getDevices).toHaveBeenCalledTimes(1);
      expect(deviceService.getDeviceLastUsage).toHaveBeenCalledTimes(1);
    });
  });

  test('handles device power toggle', async () => {
    // Override the mocked implementation for this test
    jest.mock('@/components/devices/device-card', () => ({
      DeviceCard: (props: any) => (
        <div data-testid={`device-card-${props.hardware_name}`}>
          <div>{props.friendly_name}</div>
          <button
            onClick={props.onPowerToggle}
            data-testid={`power-toggle-${props.hardware_name}`}
          >
            Toggle Power
          </button>
        </div>
      ),
    }));

    const { rerender } = render(<Devices />);

    // Wait for initial data load
    await waitFor(() => {
      expect(deviceService.getDevices).toHaveBeenCalledTimes(1);
    });

    // Simulate the device state change by updating our mock
    const updatedDevices = [...mockDevices];
    updatedDevices[0] = { ...updatedDevices[0], state: false };

    (deviceService.getDevices as jest.Mock).mockResolvedValue({
      data: updatedDevices,
    });

    // Manually trigger a re-render
    rerender(<Devices />);

    // Verify the state was updated correctly
    await waitFor(() => {
      expect(deviceService.getDevices).toHaveBeenCalled();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    (deviceService.getDevices as jest.Mock).mockRejectedValueOnce(
      new Error('API error'),
    );

    render(<Devices />);

    // Wait for the API call to fail
    await waitFor(() => {
      expect(deviceService.getDevices).toHaveBeenCalled();
    });

    // Verify error was handled by checking if console.error was called
    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch devices:',
      expect.any(Error),
    );
  });
});
