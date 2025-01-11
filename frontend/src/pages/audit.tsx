import { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/navbar/navbar';
import { AuditLog } from '@/types/logs';
import { AuditTable } from '@/components/audit/table';
import { Pagination } from '@/components/audit/pagination';
import { auditService } from '@/services/audit';

const PAGE_SIZE = 15;

export const Audit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await auditService.getAuditLogs();
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const devices = useMemo(
    () => [...new Set(logs.map((log) => log.device))],
    [logs],
  );

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (selectedDevice !== 'all') {
      filtered = filtered.filter((log) => log.device === selectedDevice);
    }

    return filtered;
  }, [logs, selectedDevice]);

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
  }, [selectedDevice]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Navbar />
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center">Loading...</div>
        </div>
      </div>
    );
  }

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
          </div>
        </div>

        <AuditTable logs={currentItems} formatDate={formatDate} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          goToPage={goToPage}
        />
      </div>
    </div>
  );
};
