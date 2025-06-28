
import { useState, useEffect } from 'react';
import { EventCard } from '@/components/EventCard';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { Header } from '@/components/Header';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PosterModal } from '@/components/PosterModal';
import { NotificationManager } from '@/components/NotificationManager';
import { useEvents } from '@/hooks/useEvents';
import { useNotifications } from '@/hooks/useNotifications';
import { Event } from '@/types/Event';

const Index = () => {
  const { events, loading, error, syncEvents, isOnline } = useEvents();
  const { requestPermission, scheduleReminder } = useNotifications();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  useEffect(() => {
    // Request notification permission on first load
    requestPermission();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [requestPermission]);

  const handleReminderSet = (event: Event, minutesBefore: number) => {
    scheduleReminder(event, minutesBefore);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading campus events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header onSync={syncEvents} isOnline={isOnline} />
      <OfflineIndicator isOnline={isOnline} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏫 CampusBoard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your centralized hub for all campus events. Never miss what matters to you.
          </p>
        </div>

        <SearchAndFilter 
          events={events} 
          onFilter={setFilteredEvents}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        {filteredEvents.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPosterClick={setSelectedPoster}
                onReminderSet={handleReminderSet}
              />
            ))}
          </div>
        )}
      </main>

      <PosterModal 
        posterUrl={selectedPoster} 
        onClose={() => setSelectedPoster(null)} 
      />
      
      <NotificationManager />
    </div>
  );
};

export default Index;
