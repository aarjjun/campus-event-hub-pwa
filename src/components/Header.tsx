
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSync: () => void;
  isOnline: boolean;
}

export const Header = ({ onSync, isOnline }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CampusBoard</h1>
              <p className="text-sm text-gray-500">Campus Events</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm text-gray-600 hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <Button
              onClick={onSync}
              disabled={!isOnline}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Sync</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
