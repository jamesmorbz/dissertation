import React, { useState } from "react";
import {
  Table,
  Card,
  Stack,
  Group,
  Button,
  Menu,
  Badge,
  ActionIcon,
  TextInput,
  Select,
} from "@mantine/core";
import { Rule, Schedule } from "./types";
import {
  IconX,
  IconTrash,
  IconEdit,
  IconCheck,
  IconStethoscope,
} from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";

interface RuleTableProps {
  rules: Rule[];
  onDeleteRule: (id: number) => void;
  onUpdateRule: (updatedRule: Rule) => void;
  testRunRule: (id: number) => void;
}

const RuleTable: React.FC<RuleTableProps> = ({
  rules,
  onDeleteRule,
  onUpdateRule,
  testRunRule,
}) => {
  const [deviceFilters, setDeviceFilters] = useState<string[]>([]);
  const [dayFilters, setDayFilters] = useState<Schedule[]>([]);
  const [timeFilters, setTimeFilters] = useState<string[]>([]);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editedRule, setEditedRule] = useState<Partial<Rule>>({});

  const toggleFilter = (
    filter: string,
    setFilters: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)
        : [...prevFilters, filter],
    );
    showNotification({
      title: "Filter updated",
      message: `${filter} filter has been ${
        deviceFilters.includes(filter) ? "removed" : "added"
      }`,
      icon: <IconCheck size={16} />,
      color: deviceFilters.includes(filter) ? "red" : "green",
    });
  };

  const toggleDayFilter = (filter: Schedule) => {
    setDayFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)
        : [...prevFilters, filter],
    );
    showNotification({
      title: "Filter updated",
      message: `${filter} filter has been ${
        dayFilters.includes(filter) ? "removed" : "added"
      }`,
      icon: <IconCheck size={16} />,
      color: dayFilters.includes(filter) ? "red" : "green",
    });
  };

  const handleEdit = (rule: Rule) => {
    setEditingRuleId(rule.id);
    setEditedRule(rule);
  };

  const handleSave = () => {
    if (editingRuleId !== null) {
      onUpdateRule({
        ...rules.find((rule) => rule.id === editingRuleId)!,
        ...editedRule,
      });
      setEditingRuleId(null);
      setEditedRule({});
    }
  };

  const filteredRules = rules.filter((rule) => {
    const deviceMatch =
      !deviceFilters.length || deviceFilters.includes(rule.device_name);
    const dayMatch =
      !dayFilters.length ||
      dayFilters.some((day) => rule.schedule.includes(day));
    const timeMatch =
      !timeFilters.length ||
      timeFilters.some(
        (timeFilter) =>
          (timeFilter === "Morning" &&
            parseInt(rule.time.split(":")[0]) < 12) ||
          (timeFilter === "Evening" && parseInt(rule.time.split(":")[0]) >= 12),
      );

    return deviceMatch && dayMatch && timeMatch;
  });

  const deviceNames = Array.from(
    new Set(rules.map((rule) => rule.device_name)),
  );
  const daysOfWeek = Object.values(Schedule);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack>
        <Group>
          {deviceFilters.map((device) => (
            <Badge
              key={device}
              color="blue"
              radius="xl"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="blue"
                  radius="xl"
                  variant="transparent"
                  onClick={() => toggleFilter(device, setDeviceFilters)}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              {device}
            </Badge>
          ))}
          {dayFilters.map((day) => (
            <Badge
              key={day}
              color="green"
              radius="xl"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="green"
                  radius="xl"
                  variant="transparent"
                  onClick={() => toggleDayFilter(day)}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              {day}
            </Badge>
          ))}
          {timeFilters.map((time) => (
            <Badge
              key={time}
              color="red"
              radius="xl"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="red"
                  radius="xl"
                  variant="transparent"
                  onClick={() => toggleFilter(time, setTimeFilters)}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              {time}
            </Badge>
          ))}
        </Group>

        <Group>
          <Menu withArrow>
            <Menu.Target>
              <Button radius="xl">Filter by Device</Button>
            </Menu.Target>
            <Menu.Dropdown>
              {deviceNames.map((device) => (
                <Menu.Item
                  key={device}
                  onClick={() => toggleFilter(device, setDeviceFilters)}
                >
                  {device}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          <Menu withArrow>
            <Menu.Target>
              <Button radius="xl">Filter by Day</Button>
            </Menu.Target>
            <Menu.Dropdown>
              {daysOfWeek.map((day) => (
                <Menu.Item key={day} onClick={() => toggleDayFilter(day)}>
                  {day}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          <Menu withArrow>
            <Menu.Target>
              <Button radius="xl">Filter by Time</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() => toggleFilter("Morning", setTimeFilters)}
              >
                Morning
              </Menu.Item>
              <Menu.Item
                onClick={() => toggleFilter("Evening", setTimeFilters)}
              >
                Evening
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Table>
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Action</th>
              <th>Time</th>
              <th>Schedule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule) => (
              <tr key={rule.id}>
                <td>
                  {editingRuleId === rule.id ? (
                    <TextInput
                      value={editedRule.device_name || rule.device_name}
                      onChange={(event) =>
                        setEditedRule({
                          ...editedRule,
                          device_name: event.currentTarget.value,
                        })
                      }
                    />
                  ) : (
                    rule.device_name
                  )}
                </td>
                <td>
                  {editingRuleId === rule.id ? (
                    <Select
                      value={editedRule.action || rule.action}
                      data={["Turn On", "Turn Off"]}
                      onChange={(value) =>
                        setEditedRule({ ...editedRule, action: value! })
                      }
                    />
                  ) : (
                    rule.action
                  )}
                </td>
                <td>
                  {editingRuleId === rule.id ? (
                    <TextInput
                      value={editedRule.time || rule.time}
                      onChange={(event) =>
                        setEditedRule({
                          ...editedRule,
                          time: event.currentTarget.value,
                        })
                      }
                    />
                  ) : (
                    rule.time
                  )}
                </td>
                <td>
                  {editingRuleId === rule.id ? (
                    <Select
                      value={
                        editedRule.schedule
                          ? editedRule.schedule[0]
                          : rule.schedule[0]
                      }
                      data={daysOfWeek}
                      onChange={(value) =>
                        setEditedRule({
                          ...editedRule,
                          schedule: [value as Schedule],
                        })
                      }
                    />
                  ) : (
                    rule.schedule.join(", ")
                  )}
                </td>
                <td>
                  {editingRuleId === rule.id ? (
                    <ActionIcon color="green" onClick={handleSave}>
                      <IconCheck size={16} />
                    </ActionIcon>
                  ) : (
                    <>
                      <ActionIcon color="blue" onClick={() => handleEdit(rule)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={() => onDeleteRule(rule.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="blue"
                        onClick={() => testRunRule(rule.id)}
                      >
                        <IconStethoscope size={16} />
                      </ActionIcon>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Card>
  );
};

export default RuleTable;
