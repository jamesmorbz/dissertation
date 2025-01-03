import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Navbar } from '@/components/navbar/navbar';

const generateLogs = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    action: i % 2 === 0 ? 'System Update' : 'Configuration Change',
    description:
      i % 2 === 0
        ? `Updated firmware version to ${2 + i / 1000}`
        : 'Modified network settings',
    type: i % 3 === 0 ? 'automated' : 'manual',
    device: `Device ${String.fromCharCode(65 + (i % 26))}`,
    timestamp: new Date(2024, 0, 2, 10, 30 + i).toISOString(),
  }));
};

const LOGS_DATA = generateLogs(1235);
const PAGE_SIZE = 15;

export function Audit() {
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const devices = useMemo(
    () => [...new Set(LOGS_DATA.map((log) => log.device))],
    [],
  );

  const types = useMemo(
    () => [...new Set(LOGS_DATA.map((log) => log.type))],
    [],
  );

  const filteredLogs = useMemo(() => {
    let filtered = LOGS_DATA;

    if (selectedDevice !== 'all') {
      filtered = filtered.filter((log) => log.device === selectedDevice);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((log) => log.type === selectedType);
    }

    return filtered;
  }, [selectedDevice, selectedType]);

  const { totalItems, totalPages, startIndex, endIndex, currentItems } =
    useMemo(() => {
      const totalItems = filteredLogs.length;
      const totalPages = Math.ceil(totalItems / PAGE_SIZE);
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
      const currentItems = filteredLogs.slice(startIndex, endIndex);

      return {
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        currentItems,
      };
    }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDevice, selectedType]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Audit Log</h1>
          <div className="flex gap-4">
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Devices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                {devices.map((device) => (
                  <SelectItem key={device} value={device}>
                    {device}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="automated">Automated</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table className="border border-gray-200">
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="border-r border-gray-200">Action</TableHead>
              <TableHead className="border-r border-gray-200">
                Description
              </TableHead>
              <TableHead className="border-r border-gray-200">Type</TableHead>
              <TableHead className="border-r border-gray-200">Device</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((log) => (
              <TableRow key={log.id} className="border-b border-gray-200">
                <TableCell className="border-r border-gray-200 text-left">
                  {log.action}
                </TableCell>
                <TableCell className="border-r border-gray-200 text-left">
                  {log.description}
                </TableCell>
                <TableCell className="border-r border-gray-200">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.type === 'automated'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {log.type}
                  </span>
                </TableCell>
                <TableCell className="border-r border-gray-200">
                  {log.device}
                </TableCell>
                <TableCell>{formatDate(log.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {endIndex} of {totalItems} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="mx-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
