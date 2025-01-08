import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ReactNode } from 'react';

interface ErrorCardProps {
  title: string;
  icon: ReactNode;
  onRefresh: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  icon,
  onRefresh,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-sm text-muted-foreground">Error Loading Data</p>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
