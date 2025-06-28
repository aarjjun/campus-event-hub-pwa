
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator = ({ isOnline }: OfflineIndicatorProps) => {
  if (isOnline) return null;

  return (
    <div className="bg-orange-500 text-white px-4 py-2 text-center">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">
          You're offline. Showing cached events.
        </span>
      </div>
    </div>
  );
};
