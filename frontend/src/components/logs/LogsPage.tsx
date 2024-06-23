import React, { useState } from 'react';
import { Table, Card, Stack, Group, Badge, Container, Button, Select, Pagination } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';

interface LogEntry {
  id: number;
  actionType: string;
  description: string;
  timestamp: string;
}

const mockLogs: LogEntry[] = [
  { id: 1, actionType: 'Rule Triggered', description: 'Turned off Living Room Light', timestamp: '2024-06-22T14:00:00' },
  { id: 2, actionType: 'User Action', description: 'Dry run of Bedroom Heater', timestamp: '2024-06-22T14:30:00' },
  { id: 3, actionType: 'New Device Added', description: 'Added Kitchen Light', timestamp: '2024-06-22T15:00:00' },
  { id: 4, actionType: 'Rule Triggered', description: 'Turned on Kitchen Light', timestamp: '2024-06-22T16:00:00' },
  // Add more mock data as needed
];

const expandedMockLogs = Array(10).fill(mockLogs).flatMap((logs, i) =>
    logs.map((log: { id: number; }) => ({ ...log, id: log.id + i * mockLogs.length }))
  );

const LogsPage: React.FC = () => {
  const [logs] = useState<LogEntry[]>(expandedMockLogs);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [activePage, setActivePage] = useState<number>(1);

  const handleStartDateChange = (date: Date | null) => {
    const now = new Date();
    if (date && date > now) {
      showNotification({
        title: "Invalid Date",
        message: "Start date can't be in the future",
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }
    if (endDate && date && date > endDate) {
      showNotification({
        title: "Invalid Date",
        message: "Start date can't be greater than end date",
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }
    setStartDate(date);
    setActivePage(1); // Reset to first page on filter change
  };

  const handleEndDateChange = (date: Date | null) => {
    const now = new Date();
    if (date && date > now) {
      showNotification({
        title: "Invalid Date",
        message: "End date can't be in the future",
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }
    if (startDate && date && date < startDate) {
      showNotification({
        title: "Invalid Date",
        message: "End date can't be less than start date",
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }
    setEndDate(date);
    setActivePage(1); // Reset to first page on filter change
  };

  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    if (startDate && logDate < startDate) {
      return false;
    }
    if (endDate && logDate > endDate) {
      return false;
    }
    return true;
  });

  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / rowsPerPage);
  const paginatedLogs = filteredLogs.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage);

  return (
    <Container>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Badge color="blue" radius="xl" size="lg" style={{ alignSelf: 'center' }}>
            Logs
          </Badge>

          <Group>
            <DateTimePicker
              placeholder="Pick start date"
              label="Start date"
              value={startDate}
              onChange={handleStartDateChange}
            />
            <DateTimePicker
              placeholder="Pick end date"
              label="End date"
              value={endDate}
              onChange={handleEndDateChange}
            />
            <Button onClick={() => { setStartDate(null); setEndDate(null); setActivePage(1); }}>Clear Filters</Button>
          </Group>

          <Table highlightOnHover striped>
            <thead>
              <tr>
                <th>Action Type</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.actionType}</td>
                  <td>{log.description}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Group>
            <Select
              label="Rows per page"
              data={['10', '25', '50']}
              value={rowsPerPage.toString()}
              onChange={(value) => {
                setRowsPerPage(Number(value));
                setActivePage(1); // Reset to first page on rows per page change
              }}
              style={{ width: '120px' }}
            />
            <Pagination value={activePage} onChange={setActivePage} total={totalPages} />
          </Group>
          
        </Stack>
      </Card>
    </Container>
  );
};

export default LogsPage;
