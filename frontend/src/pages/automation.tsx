import { useState, useEffect } from 'react';
import { automationService } from '@/services/automation';
import { deviceService } from '@/services/devices';
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
import { Clock, Ban, Zap, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Device } from '@/types/device';

const DAYS_OF_WEEK = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

const TRIGGER_TYPES = {
  PRICE: 'PRICE',
  CARBON: 'CARBON',
  SCHEDULE: 'SCHEDULE',
  USAGE: 'USAGE',
} as const;

const TRIGGER_LABELS = {
  PRICE: 'Energy Price',
  CARBON: 'Carbon Intensity',
  SCHEDULE: 'Schedule',
  USAGE: 'Energy Usage',
};

const ACTION_TYPES = {
  POWER_OFF: 'POWER_OFF',
  POWER_ON: 'POWER_ON',
} as const;

const PRICE_OPERATORS = [
  { value: 'GT', label: 'Greater Than' },
  { value: 'LT', label: 'Less Than' },
];

const INITIAL_RULE = {
  id: -1,
  hardware_name: '',
  action: 'POWER_OFF',
  trigger_type: 'SCHEDULE',
  value: '',
  active: true,
  selectedDays: [],
  scheduleTime: '',
};

type Rule = {
  id: number;
  hardware_name: string;
  action: string;
  trigger_type: string;
  value: string;
  active: boolean;
  selectedDays: string[];
  scheduleTime: string;
};

function Automation() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [newRule, setNewRule] = useState<Rule>(INITIAL_RULE);
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
    loadDevices();
  }, []);

  const loadRules = async () => {
    try {
      const response = await automationService.getAutomationRules();
      setRules(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load automation rules. Error: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const loadDevices = async () => {
    try {
      const response = await deviceService.getDevices();
      setDevices(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load devices. Error: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const formatValue = () => {
    switch (newRule.trigger_type) {
      case 'SCHEDULE':
        return `${newRule.scheduleTime}${newRule.selectedDays.join('.')}`;
      case 'PRICE': {
        const [operator = 'GT', amount = ''] = newRule.value.split(',');
        return amount ? `${operator},${amount}` : '';
      }
      case 'USAGE': {
        const amount = newRule.value;
        return amount ? `GT,${amount},30` : '';
      }
      default:
        return newRule.value;
    }
  };

  const handleAddRule = async () => {
    try {
      const ruleToSubmit = {
        ...newRule,
        value: formatValue(),
        action: newRule.trigger_type === 'USAGE' ? 'POWER_OFF' : newRule.action,
      };
      await automationService.createAutomationRule(ruleToSubmit);
      toast({
        title: 'Success',
        description: 'Rule created successfully',
      });
      loadRules();
      setNewRule(INITIAL_RULE);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create rule. Error: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleRule = async (ruleId: number, active: boolean) => {
    try {
      await automationService.toggleAutomationRule(ruleId);
      toast({
        title: 'Success',
        description: `Rule ${active ? 'enabled' : 'disabled'} successfully`,
      });
      loadRules();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update rule. Error: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'USAGE':
        return <Zap className="h-4 w-4" />;
      case 'SCHEDULE':
        return <Clock className="h-4 w-4" />;
      case 'PRICE':
        return <Ban className="h-4 w-4" />;
      case 'CARBON':
        return <Leaf className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const toggleDay = (day: string) => {
    const days = newRule.selectedDays.includes(day)
      ? newRule.selectedDays.filter((d) => d !== day)
      : [...newRule.selectedDays, day];
    setNewRule({ ...newRule, selectedDays: days });
  };

  const getValueInput = () => {
    switch (newRule.trigger_type) {
      case 'SCHEDULE':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={newRule.scheduleTime}
                onChange={(e) =>
                  setNewRule({ ...newRule, scheduleTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Days</Label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={
                      newRule.selectedDays.includes(day) ? 'default' : 'outline'
                    }
                    className="w-8 h-8 p-0"
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'PRICE': {
        const [operator = 'GT', amount = ''] = newRule.value.split(',');
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Comparison</Label>
              <Select
                value={operator}
                onValueChange={(newOperator) =>
                  setNewRule({
                    ...newRule,
                    value: `${newOperator},${amount}`,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_OPERATORS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price Threshold (pence)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    value: `${operator},${e.target.value}`,
                  })
                }
                placeholder="Enter price in pence"
              />
            </div>
          </div>
        );
      }
      case 'USAGE':
        return (
          <div className="space-y-2">
            <Label>Usage Threshold (Wh)</Label>
            <Input
              type="number"
              value={newRule.value}
              onChange={(e) =>
                setNewRule({ ...newRule, value: e.target.value })
              }
              placeholder="Enter Wh threshold"
            />
          </div>
        );
      case 'CARBON':
        return (
          <div className="space-y-2">
            <Label>Carbon Intensity Level</Label>
            <Select
              value={newRule.value}
              onValueChange={(value) =>
                setNewRule({ ...newRule, value: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERY_LOW">Very Low</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MODERATE">Moderate</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="VERY_HIGH">Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  const getValueLabel = (rule: Rule) => {
    switch (rule.trigger_type) {
      case 'PRICE': {
        const [operator, amount] = rule.value.split(',');
        const operatorLabel = operator === 'GT' ? 'Greater Than' : 'Less Than';
        return `${operatorLabel} ${amount}p`;
      }
      case 'CARBON':
        return `Green Grid Intensity: ${rule.value.replace('_', ' ')}`;
      case 'SCHEDULE': {
        const time = rule.value.slice(0, 5);
        const days = rule.value.slice(5);
        return `At ${time} on ${days.split('.').join(', ')}`;
      }
      case 'USAGE': {
        const [, amount, period] = rule.value.split(',');
        return `Greater Than ${amount}Wh in ${period} mins`;
      }
      default:
        return rule.value;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Automation Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device</Label>
                <Select
                  value={newRule.hardware_name}
                  onValueChange={(value) =>
                    setNewRule({ ...newRule, hardware_name: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select
                  value={newRule.trigger_type}
                  onValueChange={(value) =>
                    setNewRule({
                      ...newRule,
                      trigger_type: value,
                      value: value === 'PRICE' ? 'GT,' : '',
                      selectedDays: [],
                      scheduleTime: '',
                      action: value === 'USAGE' ? 'POWER_OFF' : newRule.action,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRIGGER_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {TRIGGER_LABELS[key as keyof typeof TRIGGER_LABELS]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={newRule.action}
                  onValueChange={(value) =>
                    setNewRule({ ...newRule, action: value })
                  }
                  disabled={newRule.trigger_type === 'USAGE'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTION_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {key.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">{getValueInput()}</div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleAddRule}
                disabled={
                  !newRule.hardware_name ||
                  (newRule.trigger_type === 'SCHEDULE'
                    ? !newRule.scheduleTime || newRule.selectedDays.length === 0
                    : !newRule.value)
                }
              >
                Create Rule
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={rule.active}
                      onCheckedChange={(checked) =>
                        handleToggleRule(rule.id, checked)
                      }
                    />
                    <Label>{rule.active ? 'Enabled' : 'Disabled'}</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(rule.trigger_type)}
                    <h4 className="font-medium">{rule.hardware_name}</h4>
                  </div>
                  <p className="text-sm text-gray-500">
                    {rule.action === 'POWER_OFF' ? 'Turn Off' : 'Turn On'} when{' '}
                    {getValueLabel(rule)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export { Automation };
