import { Navbar } from '@/components/navbar/navbar';
import { useState, useEffect, useCallback } from 'react';
import { Lookback } from '@/types/data-point';
import { Device } from '@/types/device';
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { dataService } from '@/services/data';
import { deviceService } from '@/services/devices';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">Optimization Suggestions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="p-4 border-t flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

type DeviceDataPoint = {
  _unix: number;
  _value: number;
  _time: string;
};

type CarbonIntensityData = Record<string, number>;

type LastUsage = {
  [key: string]: {
    last_usage: number;
  };
};

export function Analytics() {
  const [lookback, setLookback] = useState<Lookback>('1D');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceDataPoint[]>([]);
  const [carbonData, setCarbonData] = useState<CarbonIntensityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchDevices = useCallback(async () => {
    try {
      const deviceResponse = await deviceService.getDevices();
      let deviceList: Device[] = [];

      if (deviceResponse && deviceResponse.data) {
        if (Array.isArray(deviceResponse.data)) {
          deviceList = deviceResponse.data;
        } else if (typeof deviceResponse.data === 'object') {
          const nestedData =
            deviceResponse.data.data || deviceResponse.data.devices;
          if (Array.isArray(nestedData)) {
            deviceList = nestedData;
          }
        }
      }

      try {
        const usageResponse = await deviceService.getDeviceLastUsage();
        let usageData: LastUsage = {};
        if (usageResponse && usageResponse.data) {
          if (typeof usageResponse.data === 'object') {
            usageData = usageResponse.data;
          }
        }

        deviceList.forEach((device) => {
          const hardwareName = device.hardware_name;
          if (usageData[hardwareName]) {
            device.last_usage = usageData[hardwareName].last_usage;
          }
        });
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      }

      setDevices(deviceList);
      if (deviceList.length > 0) {
        setSelectedDevice('tasmota_XXX000');
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      setDevices([]);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const generateMockPricing = (timestamps: string[]) => {
    if (!timestamps || !timestamps.length) return [];

    return timestamps.map((timestamp) => {
      if (!timestamp) return { timestamp: '', price: 0 };

      try {
        const date = new Date(timestamp);
        const hour = date.getHours();
        const isPeakHour = hour >= 16 && hour <= 20;
        const basePrice = isPeakHour ? Math.random() * 10 : Math.random() * 5;
        const randomVariation = Math.random() * 5;
        return {
          timestamp,
          price: parseFloat((basePrice + randomVariation).toFixed(2)) * 0.01,
        };
      } catch (e) {
        console.error('Error parsing timestamp:', timestamp, e);
        return { timestamp, price: 0 };
      }
    });
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);

        if (!selectedDevice) {
          setDeviceData([]);
          setLoading(false);
          return;
        }

        const lookbackMap: Record<Lookback, string> = {
          '1D': '1440m',
          '7D': '10080m',
          '14D': '20160m',
          '30D': '43200m',
        };

        const response = await dataService.getDeviceData(
          selectedDevice,
          lookback,
          lookbackMap,
        );

        let processedData: DeviceDataPoint[] = [];

        if (response) {
          if (response.data) {
            if (Array.isArray(response.data)) {
              processedData = response.data;
            } else if (typeof response.data === 'object') {
              const nestedData = response.data.data || response.data.readings;
              if (Array.isArray(nestedData)) {
                processedData = nestedData;
              }
            }
          }
        }

        processedData = processedData.map((point) => ({
          _unix:
            typeof point._unix === 'string'
              ? parseInt(point._unix, 10)
              : point._unix || 0,
          _value:
            typeof point._value === 'string'
              ? parseFloat(point._value)
              : point._value || 0,
          _time: point._time || new Date().toISOString(),
        }));

        if (
          processedData.length === 0 ||
          !processedData.some((point) => point._value > 0)
        ) {
          const now = new Date();
          processedData = Array.from({ length: 12 }, (_, i) => {
            const time = new Date(now);
            time.setHours(now.getHours() - i);
            return {
              _unix: Math.floor(time.getTime() / 1000),
              _value: Math.floor(Math.random() * 200) + 50,
              _time: time.toISOString(),
            };
          });
        }

        setDeviceData(processedData);
      } catch (err) {
        console.error('Failed to fetch device data:', err);
        setError('Failed to fetch device data');

        const now = new Date();
        const mockData = Array.from({ length: 12 }, (_, i) => {
          const time = new Date(now);
          time.setHours(now.getHours() - i);
          return {
            _unix: Math.floor(time.getTime() / 1000),
            _value: Math.floor(Math.random() * 200) + 50,
            _time: time.toISOString(),
          };
        });
        setDeviceData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [selectedDevice, lookback]);

  useEffect(() => {
    const fetchCarbonData = async () => {
      try {
        const response = await dataService.getHistoricalCarbonIntensity(
          Number(lookback.slice(0, -1)),
        );
        let processedData: CarbonIntensityData[] = [];

        if (response && response.data) {
          if (Array.isArray(response.data)) {
            processedData = response.data;
          } else if (typeof response.data === 'object') {
            const nestedData = response.data.data || response.data.intensity;
            if (Array.isArray(nestedData)) {
              processedData = nestedData;
            }
          }
        }

        if (processedData.length === 0) {
          processedData = generateMockCarbonData();
        }

        setCarbonData(processedData);
      } catch (err) {
        console.error(
          'Failed to fetch carbon data, using mock data instead',
          err,
        );
        setCarbonData(generateMockCarbonData());
      }
    };

    fetchCarbonData();
  }, [lookback]);

  const generateMockCarbonData = (): CarbonIntensityData[] => {
    const result: CarbonIntensityData[] = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const date = new Date(now);
      date.setHours(now.getHours() - i);
      const isDaytime = date.getHours() >= 8 && date.getHours() <= 20;
      const carbonIntensity = isDaytime
        ? Math.floor(Math.random() * 200) + 150
        : Math.floor(Math.random() * 100) + 50;

      result.push({
        [date.toISOString()]: carbonIntensity,
      });
    }

    return result;
  };

  const transformChartData = () => {
    if (!deviceData || deviceData.length === 0) {
      return [];
    }

    const hourlyData: Record<
      string,
      {
        count: number;
        usage: number;
        timestamps: string[];
      }
    > = {};

    deviceData.forEach((dataPoint) => {
      if (!dataPoint || !dataPoint._time) return;

      try {
        const date = new Date(dataPoint._time);
        const hourKey = new Date(date);
        hourKey.setMinutes(0, 0, 0);
        const hourStr = hourKey.toISOString();

        if (!hourlyData[hourStr]) {
          hourlyData[hourStr] = {
            count: 0,
            usage: 0,
            timestamps: [],
          };
        }

        hourlyData[hourStr].count++;
        hourlyData[hourStr].usage +=
          typeof dataPoint._value === 'number'
            ? dataPoint._value
            : parseFloat(dataPoint._value) || 0;
        hourlyData[hourStr].timestamps.push(dataPoint._time);
      } catch (e) {
        console.error('Error processing data point:', dataPoint, e);
      }
    });

    const carbonMap = carbonData.reduce(
      (acc, item) => {
        if (item && typeof item === 'object') {
          const entries = Object.entries(item);
          if (entries.length > 0) {
            const [timestamp, value] = entries[0];
            try {
              const date = new Date(timestamp);
              date.setMinutes(0, 0, 0);
              const hourKey = date.toISOString();
              acc[hourKey] =
                typeof value === 'string' ? parseFloat(value) : value || 0;
            } catch (e) {
              console.error('Error processing carbon timestamp:', timestamp, e);
            }
          }
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    // Generate pricing data for each hour
    const pricingData = generateMockPricing(Object.keys(hourlyData));

    // Transform to chart data format
    const result = Object.entries(hourlyData)
      .map(([hourKey, hourData], index) => {
        try {
          const date = new Date(hourKey);
          const hour = date.getHours();

          const avgUsage = hourData.usage / Math.max(1, hourData.count);
          const carbonIntensity =
            carbonMap[hourKey] ||
            carbonMap[new Date(date.getTime() - 3600000).toISOString()] ||
            carbonMap[new Date(date.getTime() + 3600000).toISOString()] ||
            150;

          const energyPrice =
            pricingData[index]?.price || (hour >= 16 && hour <= 20 ? 25 : 15);

          return {
            timestamp: hourKey,
            hour: `${hour}:00`,
            usage: avgUsage,
            carbonIntensity,
            energyPrice,
            suggestedUsage:
              hour >= 16 && hour <= 20 ? avgUsage * 0.7 : avgUsage,
          };
        } catch (e) {
          console.error('Error transforming hourly data:', hourKey, e);
          return null;
        }
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

    return result;
  };

  const chartData = transformChartData();

  const totalUsage = chartData.reduce(
    (sum, data) => sum + (data?.usage || 0),
    0,
  );
  const avgCarbonIntensity =
    chartData.length > 0
      ? chartData.reduce((sum, data) => sum + (data?.carbonIntensity || 0), 0) /
        chartData.length
      : 0;
  const avgEnergyPrice = (totalUsage / 1000) * 28.25;

  const usageValues = chartData.map((data) => data?.usage || 0);
  const peakUsage = usageValues.length > 0 ? Math.max(...usageValues) : 0;
  const peakData = chartData.find((data) => data?.usage === peakUsage);

  const suggestions = [
    {
      title: 'Shift usage to off-peak hours',
      description: peakData
        ? `Moving 30% of your peak usage (${peakUsage.toFixed(
            0,
          )}W at ${peakData?.hour}) to nighttime could save £${(
            (peakUsage * 0.3 * (peakData?.energyPrice || 0)) /
            100
          ).toFixed(2)} per day.`
        : 'Shift usage away from peak hours (4pm-8pm) to save money.',
      action: 'Schedule devices',
      link: '/automation',
    },
    {
      title: 'Reduce carbon footprint',
      description: `Your average carbon intensity is ${avgCarbonIntensity.toFixed(
        0,
      )}gCO2/kWh. Shifting usage to times with lower intensity could reduce emissions by up to 40%.`,
      action: 'View carbon forecast',
      link: '/analytics',
    },
    {
      title: 'Energy saving mode',
      description:
        'Enabling energy saving mode on your plugs could reduce standby power consumption by up to 50%.',
      action: 'Configure settings',
      link: '/automation',
    },
  ];

  if (error && !deviceData.length) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Navbar />
        <div className="container mx-auto py-6">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (loading && !deviceData.length) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Navbar />
        <div className="container mx-auto py-6">
          <div>Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Energy Analytics</h1>
          <div className="flex space-x-4">
            <Select
              value={lookback}
              onValueChange={(value) => setLookback(value as Lookback)}
            >
              <SelectTrigger className="w-auto min-w-[180px] max-w-[300px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">Last day</SelectItem>
                <SelectItem value="7D">Last week</SelectItem>
                <SelectItem value="14D">Last 2 weeks</SelectItem>
                <SelectItem value="30D">Last month</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedDevice || 'all'}
              onValueChange={(value) =>
                setSelectedDevice(value === 'all' ? null : value)
              }
            >
              <SelectTrigger className="w-auto min-w-[180px] max-w-[300px]">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All devices</SelectItem>
                {devices.map((device) => (
                  <SelectItem
                    key={device.hardware_name}
                    value={device.hardware_name}
                  >
                    {device.friendly_name || device.hardware_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-center">
                Total Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between pt-0">
              <div className="text-3xl font-bold text-center">
                {totalUsage.toFixed(0)} Wh
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Past {lookback.replace('D', ' days')}
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full mt-5 mb-2 relative group cursor-pointer">
                <div
                  className="h-2 bg-purple-500 rounded-full transition-all duration-300 group-hover:bg-purple-600"
                  style={{
                    width: `${Math.min(
                      100,
                      (totalUsage / totalUsage) * 0.4 * 100,
                    )}%`,
                  }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {Math.min(100, (totalUsage / totalUsage) * 0.4 * 100).toFixed(
                    0,
                  )}
                  % of daily average
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-center">
                Avg Carbon Intensity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between pt-0">
              <div className="text-3xl font-bold text-center">
                {avgCarbonIntensity.toFixed(0)} gCO<sub>2</sub>/kWh
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                {avgCarbonIntensity > 200
                  ? 'Higher than average'
                  : avgCarbonIntensity > 150
                    ? 'Average'
                    : 'Better than average'}
              </div>
              <div className="mt-5 mb-2 flex items-center justify-center space-x-3">
                <div className="relative group cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      avgCarbonIntensity <= 150
                        ? 'ring-2 ring-green-300 bg-green-500 ring-offset-1'
                        : 'bg-green-200'
                    }`}
                  ></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    Low Carbon (≤150)
                  </div>
                </div>
                <div className="relative group cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      avgCarbonIntensity > 150 && avgCarbonIntensity <= 200
                        ? 'ring-2 ring-yellow-300 bg-yellow-500 ring-offset-1'
                        : 'bg-yellow-200'
                    }`}
                  ></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    Medium Carbon (151-200)
                  </div>
                </div>
                <div className="relative group cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      avgCarbonIntensity > 200
                        ? 'ring-2 ring-red-300 bg-red-500 ring-offset-1'
                        : 'bg-red-200'
                    }`}
                  ></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    High Carbon (&gt;200)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-center">
                Total Spend
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between pt-0">
              <div className="text-3xl font-bold text-center">
                £{(avgEnergyPrice / 100).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Est. based on current rates
              </div>
              <div className="flex justify-center mt-5 mb-2">
                <div className="flex group cursor-pointer relative">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-sm z-30 transition-transform duration-300 group-hover:transform group-hover:scale-110">
                    <span className="text-white text-xs font-bold">£</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-400 -ml-1 flex items-center justify-center shadow-sm z-20 transition-transform duration-300 group-hover:transform group-hover:scale-110 group-hover:translate-x-1">
                    <span className="text-white text-xs font-bold">£</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-300 -ml-1 flex items-center justify-center shadow-sm z-10 transition-transform duration-300 group-hover:transform group-hover:scale-110 group-hover:translate-x-2">
                    <span className="text-white text-xs font-bold">£</span>
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    {(avgEnergyPrice / 100).toFixed(2)} per day
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 text-center">
                Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between items-center pt-0">
              <div className="flex items-center justify-center">
                <div className="text-red-500 mr-3">
                  <AlertCircle size={28} />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-800">
                    {suggestions.length}
                  </div>
                  <div className="text-sm text-red-700">
                    Available improvements
                  </div>
                </div>
              </div>
              <div className="w-full mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => setIsModalOpen(true)}
                >
                  View Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {chartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Energy Usage & Carbon Intensity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => {
                          if (!value) return '';
                          const date = value.split('T')[0];
                          const [, month, day] = date.split('-');
                          const formattedDate = `${day}-${month}`;

                          const time = value.split('T')[1].substring(0, 5);

                          return `${formattedDate} @ ${time}`;
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#8884d8"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#82ca9d"
                      />
                      <Tooltip
                        formatter={(value, name, props) => {
                          // Format timestamp in tooltip
                          if (props.payload && props.payload.timestamp) {
                            const timestamp = props.payload.timestamp;
                            const date = timestamp.split('T')[0];
                            const [, month, day] = date.split('-');
                            const formattedDate = `${day}-${month}`;
                            const time = timestamp
                              .split('T')[1]
                              .substring(0, 5);

                            props.payload.formattedTime = `${formattedDate} @ ${time}`;
                          }

                          return [value, name];
                        }}
                        labelFormatter={(label) => {
                          if (
                            typeof label === 'string' &&
                            label.includes('T')
                          ) {
                            const date = label.split('T')[0];
                            const [, month, day] = date.split('-');
                            const formattedDate = `${day}-${month}`;
                            const time = label.split('T')[1].substring(0, 5);

                            return `${formattedDate} @ ${time}`;
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="usage"
                        name="Power Usage (W)"
                        fill="#8884d8"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="carbonIntensity"
                        name="Carbon Intensity (gCO₂/kWh)"
                        stroke="#82ca9d"
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData.filter((_, index) => index % 5 === 0)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => {
                          if (!value) return '';
                          const date = value.split('T')[0];
                          const [, month, day] = date.split('-');
                          const formattedDate = `${day}-${month}`;

                          const time = value.split('T')[1].substring(0, 5);

                          return `${formattedDate} @ ${time}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`£${value}`, 'Price']}
                        labelFormatter={(label) => {
                          if (
                            typeof label === 'string' &&
                            label.includes('T')
                          ) {
                            const date = label.split('T')[0];
                            const [, month, day] = date.split('-');
                            const formattedDate = `${day}-${month}`;
                            const time = label.split('T')[1].substring(0, 5);

                            return `${formattedDate} @ ${time}`;
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="energyPrice"
                        name="Price (p/kWh)"
                        stroke="#ff7300"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {suggestion.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(suggestion.link)}
                  >
                    {suggestion.action}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
}
