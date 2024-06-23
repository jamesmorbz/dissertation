// AddRuleForm.tsx
import React, { useState } from 'react';
import { Button, Card, Group, Stack, Checkbox, Select, Notification, rem } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { Schedule, AddRuleFormProps } from './types'
import { IconX, IconCheck } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';

const RuleAdder: React.FC<AddRuleFormProps> = ({ onAddRule }) => {
    const [deviceName, setDeviceName] = useState<string | null>(null);
    const [action, setAction] = useState<string | null>(null);
    const [time, setTime] = useState<string >('');
    const [schedule, setSchedule] = useState<Schedule[]>([]);

    const validActions = ["POWER_ON", "POWER OFF"]
    const currentDevices = ["TASMOTA_XXXXXX", "TASMOTA_YYYYYY"]

    const resetForm = () => {
        setDeviceName(null);
        setAction(null);
        setTime('');
        setSchedule([]);
    }

    const validateInput = () => {

    }

    const handleCheckboxChange = (day: Schedule) => {
        setSchedule((prevSchedule) =>
            prevSchedule.includes(day)
                ? prevSchedule.filter((d) => d !== day)
                : [...prevSchedule, day]
        );
    };

    const handleTimeChange = (value: string) => {
        setTime(value);
      };

    const handleSubmit = () => {
        if (deviceName && action && time && schedule) {
            console.log({
                device_name: deviceName,
                action,
                time: time, // Format to HH:mm
                schedule: schedule 
            });
            showNotification({
                title: 'Rule Added',
                message: `Rule for ${deviceName} successfully Added`,
                icon: <IconCheck size={16} />,
                color: 'green',
              });
            resetForm()

        } else {
            showNotification({
                title: 'Rule Not Added',
                message: `You need to fill out all the fields to add a rule`,
                icon: <IconX size={16} />,
                color: 'red',
              });
        }
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack>
                <Select
                    label="Device Name"
                    placeholder="Select a Device"
                    data={currentDevices}
                    value={deviceName}
                    onChange={(value) => setDeviceName(value)}
                    required
                />
                <Select
                    label="Action"
                    placeholder="Select an action"
                    data={validActions}
                    value={action}
                    onChange={(value) => setAction(value)}
                    required
                />
                <TimeInput
                    label="Time"
                    value={time}
                    onChange={(e) => handleTimeChange(e.currentTarget.value)}
                    required
                />
                <Checkbox.Group label="Schedule"> 
                    <Group mt="xs">
                    {Object.values(Schedule).map((day) => (
                        <Checkbox
                            key={day}
                            label={day}
                            value={day}
                            checked={schedule.includes(day)}
                            onChange={() => handleCheckboxChange(day as Schedule)}
                        />
                    ))}
                    </Group>
                </Checkbox.Group>
                <Group mt="md">
                    <Button onClick={handleSubmit}>Add Rule</Button>
                </Group>
            </Stack>
        </Card>
    );
};

export default RuleAdder;
