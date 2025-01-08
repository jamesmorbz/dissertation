import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const SkeletonCard = () => {
  return (
    <Card className="flex items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </Card>
  );
};

export { SkeletonCard };
