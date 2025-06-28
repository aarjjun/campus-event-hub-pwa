
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export const RealtimeIndicator = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Monitor connection status
    const channel = supabase.channel('connection-status');
    
    channel
      .on('system', {}, (payload) => {
        if (payload.status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (payload.status === 'CLOSED') {
          setIsConnected(false);
        }
      })
      .subscribe();

    // Test channel for connectivity
    const testChannel = supabase
      .channel('test-connectivity')
      .on('broadcast', { event: 'test' }, () => {
        setLastUpdate(new Date());
      })
      .subscribe();

    // Send test message periodically
    const interval = setInterval(() => {
      testChannel.send({
        type: 'broadcast',
        event: 'test',
        payload: { timestamp: Date.now() }
      });
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(testChannel);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className={`flex items-center gap-2 ${
          isConnected 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isConnected ? (
          <>
            <Zap className="w-3 h-3" />
            <span className="text-xs">Live Updates</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span className="text-xs">Disconnected</span>
          </>
        )}
      </Badge>
      
      {lastUpdate && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
