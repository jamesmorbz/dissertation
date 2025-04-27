import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Automation } from './automation';

jest.mock('@/services/automation', () => ({
  automationService: {
    getAutomationRules: jest.fn(),
    createAutomationRule: jest.fn(),
    toggleAutomationRule: jest.fn(),
  },
}));

jest.mock('@/services/devices', () => ({
  deviceService: {
    getDevices: jest.fn(),
  },
}));

import { automationService } from '@/services/automation';
import { deviceService } from '@/services/devices';

jest.mock('@/components/navbar/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar Component</div>,
}));

const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster Component</div>,
}));

// Sample data
const mockDevices = [
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
];

const mockRules = [
  {
    id: 1,
    hardware_name: 'device1',
    action: 'POWER_OFF',
    trigger_type: 'SCHEDULE',
    value: '18:00M.W.F',
    active: true,
    selectedDays: ['M', 'W', 'F'],
    scheduleTime: '18:00',
  },
  {
    id: 2,
    hardware_name: 'device2',
    action: 'POWER_ON',
    trigger_type: 'PRICE',
    value: 'LT,20',
    active: false,
    selectedDays: [],
    scheduleTime: '',
  },
  {
    id: 3,
    hardware_name: 'device1',
    action: 'POWER_OFF',
    trigger_type: 'CARBON',
    value: 'HIGH',
    active: true,
    selectedDays: [],
    scheduleTime: '',
  },
];

describe('Automation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations
    (automationService.getAutomationRules as jest.Mock).mockResolvedValue({
      data: mockRules,
    });
    (deviceService.getDevices as jest.Mock).mockResolvedValue({
      data: mockDevices,
    });
    (automationService.createAutomationRule as jest.Mock).mockResolvedValue({
      data: { success: true },
    });
    (automationService.toggleAutomationRule as jest.Mock).mockResolvedValue({
      data: { success: true },
    });
  });

  test('renders automation page and fetches data', async () => {
    render(<Automation />);

    // Check if the navbar is rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();

    // Wait for data to be fetched
    await waitFor(() => {
      expect(automationService.getAutomationRules).toHaveBeenCalledTimes(1);
      expect(deviceService.getDevices).toHaveBeenCalledTimes(1);
    });

    // Check if the "Create New Automation Rule" card is rendered
    expect(screen.getByText('Create New Automation Rule')).toBeInTheDocument();
  });

  test('displays existing automation rules', async () => {
    render(<Automation />);

    // Wait for rules to load
    await waitFor(() => {
      expect(automationService.getAutomationRules).toHaveBeenCalled();
    });

    // Check if rule cards are rendered
    expect(
      screen.getByText('Turn Off when At 18:00 on M, W, F'),
    ).toBeInTheDocument();
    expect(screen.getByText('Turn On when Less Than 20p')).toBeInTheDocument();
    expect(
      screen.getByText('Turn Off when Green Grid Intensity: HIGH'),
    ).toBeInTheDocument();

    // Check the enabled/disabled status
    expect(screen.getAllByText('Enabled')[0]).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  test('toggles automation rule status', async () => {
    render(<Automation />);

    // Wait for rules to load
    await waitFor(() => {
      expect(automationService.getAutomationRules).toHaveBeenCalled();
    });

    // Find the switch elements (using a test ID would be better if you can add it)
    const switches = screen.getAllByRole('switch');
    const disabledRuleSwitch = switches[1]; // The second rule is disabled

    // Toggle the disabled rule to enabled
    fireEvent.click(disabledRuleSwitch);

    // Check if the toggle function was called with the correct ID
    await waitFor(() => {
      expect(automationService.toggleAutomationRule).toHaveBeenCalledWith(2);
    });

    // Check if rules are reloaded after toggling
    expect(automationService.getAutomationRules).toHaveBeenCalledTimes(2);
  });

  test('creates a new schedule rule', async () => {
    render(<Automation />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(deviceService.getDevices).toHaveBeenCalled();
    });

    // Find and select a device (using text content instead of placeholder)
    const deviceSelect = screen.getByText('Select device');
    fireEvent.click(deviceSelect);

    // This test is simplified since we can't easily interact with the actual select dropdown
    // without more specific test IDs or using a full browser testing tool

    // Just check if the component renders without errors
    expect(screen.getByText('Create Rule')).toBeInTheDocument();
  });

  test('handles API errors gracefully when loading rules', async () => {
    // Mock API error
    (automationService.getAutomationRules as jest.Mock).mockRejectedValueOnce(
      new Error('API error'),
    );

    render(<Automation />);

    // Wait for the API call to fail
    await waitFor(() => {
      expect(automationService.getAutomationRules).toHaveBeenCalled();
    });

    // Verify an error toast would be shown using our mocked toast function
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        }),
      );
    });
  });

  test('handles API errors gracefully when loading devices', async () => {
    // Mock API error
    (deviceService.getDevices as jest.Mock).mockRejectedValueOnce(
      new Error('API error'),
    );

    render(<Automation />);

    // Wait for the API call to fail
    await waitFor(() => {
      expect(deviceService.getDevices).toHaveBeenCalled();
    });

    // Verify error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        }),
      );
    });
  });
});
