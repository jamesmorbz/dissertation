import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AuditLog } from '@/types/logs';

interface AuditTableProps {
  logs: AuditLog[];
  formatDate: (date: string) => string;
}

const AuditTable: React.FC<AuditTableProps> = ({ logs, formatDate }) => (
  <Table className="border border-gray-200">
    <TableHeader>
      <TableRow className="border-b border-gray-200">
        <TableHead className="border-r border-gray-200">Action</TableHead>
        <TableHead className="border-r border-gray-200">Details</TableHead>
        <TableHead className="border-r border-gray-200">Device</TableHead>
        <TableHead>Timestamp</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {logs.map((log) => (
        <TableRow key={log.id} className="border-b border-gray-200">
          <TableCell className="border-r border-gray-200 text-left">
            {log.action_type}
          </TableCell>
          <TableCell className="border-r border-gray-200 text-left">
            <div>
              <p className="font-medium">{log.log}</p>
              <p className="text-sm text-gray-500">{log.details}</p>
            </div>
          </TableCell>
          <TableCell className="border-r border-gray-200">
            {log.device}
          </TableCell>
          <TableCell>{formatDate(log.timestamp)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export { AuditTable };
