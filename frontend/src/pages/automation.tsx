import React, { useState } from 'react';
import { Navbar } from '@/components/navbar/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Zap, Leaf, Clock, Power } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { DeviceWithRules, DeviceRule } from '@/types/device-rule';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const INITIAL_DEVICES: DeviceWithRules[] = [
  {
    device: {
      hardware_name: 'tasmota_XXX000',
      friendly_name: 'BedroomPlug1',
      room: 'Bedroom',
      tag: 'Charger',
      power: true,
      last_usage: 5,
    },
    rules: [
      {
        id: 1,
        type: 'usage',
        enabled: true,
        threshold: 100,
        action: 'turnOff',
      },
      {
        id: 2,
        type: 'schedule',
        enabled: true,
        time: '22:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        action: 'turnOff',
      },
      {
        id: 3,
        type: 'energy_price',
        enabled: true,
        price_threshold: 0.15,
        action: 'turnOn',
      },
      {
        id: 4,
        type: 'carbon_intensity',
        enabled: true,
        intensity_level: 'low',
        action: 'turnOn',
      },
    ],
  },
  {
    hardware_name: 'tasmota_XXX001',
    friendly_name: 'KitchenPlug1',
    tag: ['Kitchen', 'Appliance'],
    status: 'ONLINE',
    last_usage: '15W',
    rules: [],
  },
];

const INITIAL_RULE = {
  type: 'usage' as const,
  threshold: '',
  time: '',
  days: [] as string[],
  price_threshold: '',
  intensity_level: 'low' as const,
  action: 'turnOff' as const,
};

export function Automation() {
  const [devices, setDevices] = useState<DeviceWithRules[]>(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<string>(
    devices[0]?.device.hardware_name,
  );
  const [newRule, setNewRule] = useState(INITIAL_RULE);
  const { toast } = useToast();

  const getRuleIcon = (type: DeviceRule['type']) => {
    switch (type) {
      case 'usage':
        return <Power className="h-4 w-4" />;
      case 'schedule':
        return <Clock className="h-4 w-4" />;
      case 'energy_price':
        return <Zap className="h-4 w-4" />;
      case 'carbon_intensity':
        return <Leaf className="h-4 w-4" />;
    }
  };

  const addRule = () => {
    setDevices(
      devices.map((device) => {
        if (device.hardware_name === selectedDevice) {
          const newId = Math.max(0, ...device.rules.map((r) => r.id)) + 1;
          return {
            ...device,
            rules: [...device.rules, { ...newRule, id: newId, enabled: true }],
          };
        }
        return device;
      }),
    );
    setNewRule(INITIAL_RULE);
    toast({
      title: 'Rule Added',
      description: 'New automation rule has been created successfully.',
    });
  };

  const deleteRule = (deviceId: string, ruleId: number) => {
    setDevices(
      devices.map((device) => {
        if (device.device.hardware_name === deviceId) {
          return {
            ...device,
            rules: device.rules.filter((rule) => rule.id !== ruleId),
          };
        }
        return device;
      }),
    );
    toast({
      title: 'Rule Deleted',
      description: 'Automation rule has been removed.',
      variant: 'destructive',
    });
  };

  const toggleRule = (deviceId: string, ruleId: number) => {
    setDevices(
      devices.map((device) => {
        if (device.device.hardware_name === deviceId) {
          return {
            ...device,
            rules: device.rules.map((rule) => {
              if (rule.id === ruleId) {
                const newState = !rule.enabled;
                toast({
                  title: newState ? 'Rule Enabled' : 'Rule Disabled',
                  description: `Automation rule has been ${
                    newState ? 'enabled' : 'disabled'
                  }.`,
                });
                return { ...rule, enabled: newState };
              }
              return rule;
            }),
          };
        }
        return device;
      }),
    );
  };

  interface RuleCardProps {
    rule: DeviceRule;
    deviceId: string;
    showDevice?: boolean;
  }

  const RuleCard: React.FC<RuleCardProps> = ({
    rule,
    deviceId,
    showDevice = false,
  }) => {
    const device = devices.find((d) => d.device.hardware_name === deviceId);
    const getRuleContent = () => {
      switch (rule.type) {
        case 'usage':
          return {
            title: 'Usage Rule',
            description: `Turn ${
              rule.action === 'turnOff' ? 'off' : 'on'
            } when usage exceeds ${rule.threshold}W`,
          };
        case 'schedule':
          return {
            title: 'Schedule Rule',
            description: `Turn ${rule.action === 'turnOff' ? 'off' : 'on'} at ${
              rule.time
            } on ${rule.days?.join(', ')}`,
          };
        case 'energy_price':
          return {
            title: 'Energy Price Rule',
            description: `Turn ${
              rule.action === 'turnOff' ? 'off' : 'on'
            } when price is below £${rule.price_threshold}/kWh`,
          };
        case 'carbon_intensity':
          return {
            title: 'Carbon Intensity Rule',
            description: `Turn ${
              rule.action === 'turnOff' ? 'off' : 'on'
            } when grid carbon intensity is ${rule.intensity_level}`,
          };
      }
    };

    const { title, description } = getRuleContent();

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => toggleRule(deviceId, rule.id)}
              />
              <Label>{rule.enabled ? 'Enabled' : 'Disabled'}</Label>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteRule(deviceId, rule.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {showDevice && (
            <div className="mb-2 text-sm font-medium text-gray-500">
              {device?.device.friendly_name || device?.device.hardware_name}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getRuleIcon(rule.type)}
              <h4 className="font-medium">{title}</h4>
            </div>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const allRules = devices.flatMap((device) =>
    device.rules.map((rule) => ({
      ...rule,
      deviceId: device.device.hardware_name,
    })),
  );

  const usageRules = allRules.filter((rule) => rule.type === 'usage');
  const scheduleRules = allRules.filter((rule) => rule.type === 'schedule');
  const energyRules = allRules.filter((rule) => rule.type === 'energy_price');
  const carbonRules = allRules.filter(
    (rule) => rule.type === 'carbon_intensity',
  );

  const AddRuleForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Rule Type</Label>
          <Select
            value={newRule.type}
            onValueChange={(value: DeviceRule['type']) =>
              setNewRule({
                ...newRule,
                type: value,
                action: value === 'usage' ? 'turnOff' : 'turnOn',
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usage">Usage Threshold</SelectItem>
              <SelectItem value="schedule">Schedule</SelectItem>
              <SelectItem value="energy_price">Energy Price</SelectItem>
              <SelectItem value="carbon_intensity">Carbon Intensity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Action</Label>
          <Select
            value={newRule.action}
            onValueChange={(value: 'turnOn' | 'turnOff') =>
              setNewRule({ ...newRule, action: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="turnOn">Turn On</SelectItem>
              <SelectItem value="turnOff">Turn Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {newRule.type === 'usage' && (
          <div className="space-y-2">
            <Label>Usage Threshold (W)</Label>
            <Input
              type="number"
              value={newRule.threshold}
              onChange={(e) =>
                setNewRule({
                  ...newRule,
                  threshold: parseFloat(e.target.value),
                })
              }
              placeholder="Enter watts"
            />
          </div>
        )}

        {newRule.type === 'schedule' && (
          <>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={newRule.time}
                onChange={(e) =>
                  setNewRule({ ...newRule, time: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Days of Week</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day}
                    variant={newRule.days.includes(day) ? 'default' : 'outline'}
                    className="h-8"
                    onClick={() => {
                      const days = newRule.days.includes(day)
                        ? newRule.days.filter((d) => d !== day)
                        : [...newRule.days, day];
                      setNewRule({ ...newRule, days });
                    }}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {newRule.type === 'energy_price' && (
          <div className="space-y-2">
            <Label>Price Threshold (£/kWh)</Label>
            <Input
              type="number"
              step="0.01"
              value={newRule.price_threshold}
              onChange={(e) =>
                setNewRule({
                  ...newRule,
                  price_threshold: parseFloat(e.target.value),
                })
              }
              placeholder="Enter price per kWh"
            />
          </div>
        )}

        {newRule.type === 'carbon_intensity' && (
          <div className="space-y-2">
            <Label>Carbon Intensity Level</Label>
            <Select
              value={newRule.intensity_level}
              onValueChange={(value: DeviceRule['intensity_level']) =>
                setNewRule({ ...newRule, intensity_level: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_low">Very Low</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={addRule}
          disabled={
            (newRule.type === 'usage' && !newRule.threshold) ||
            (newRule.type === 'schedule' &&
              (!newRule.time || newRule.days.length === 0)) ||
            (newRule.type === 'energy_price' && !newRule.price_threshold) ||
            (newRule.type === 'carbon_intensity' && !newRule.intensity_level)
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <div className="container mx-auto py-6">
        <Tabs defaultValue="add" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Device Automation Rules</h2>
            <TabsList>
              <TabsTrigger value="add">Add Rule</TabsTrigger>
              <TabsTrigger value="usage">Usage Rules</TabsTrigger>
              <TabsTrigger value="schedule">Schedule Rules</TabsTrigger>
              <TabsTrigger value="energy">Energy Price Rules</TabsTrigger>
              <TabsTrigger value="carbon">Carbon Rules</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Rule</CardTitle>
              </CardHeader>
              <CardContent>
                <AddRuleForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {usageRules.map((rule) => (
                <RuleCard
                  key={`${rule.deviceId}-${rule.id}`}
                  rule={rule}
                  deviceId={rule.deviceId}
                  showDevice={true}
                />
              ))}
              {usageRules.length === 0 && (
                <Card className="col-span-full p-6">
                  <p className="text-center text-gray-500">
                    No usage rules configured
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scheduleRules.map((rule) => (
                <RuleCard
                  key={`${rule.deviceId}-${rule.id}`}
                  rule={rule}
                  deviceId={rule.deviceId}
                  showDevice={true}
                />
              ))}
              {scheduleRules.length === 0 && (
                <Card className="col-span-full p-6">
                  <p className="text-center text-gray-500">
                    No schedule rules configured
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="energy">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {energyRules.map((rule) => (
                <RuleCard
                  key={`${rule.deviceId}-${rule.id}`}
                  rule={rule}
                  deviceId={rule.deviceId}
                  showDevice={true}
                />
              ))}
              {energyRules.length === 0 && (
                <Card className="col-span-full p-6">
                  <p className="text-center text-gray-500">
                    No energy price rules configured
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="carbon">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {carbonRules.map((rule) => (
                <RuleCard
                  key={`${rule.deviceId}-${rule.id}`}
                  rule={rule}
                  deviceId={rule.deviceId}
                  showDevice={true}
                />
              ))}
              {carbonRules.length === 0 && (
                <Card className="col-span-full p-6">
                  <p className="text-center text-gray-500">
                    No carbon intensity rules configured
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}
